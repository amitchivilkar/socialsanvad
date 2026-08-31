import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  isBlogMsg91Configured,
  sendBlogUpdateBulk,
  sendBlogUpdateWhatsApp,
} from "@/lib/msg91";
import { getOrder, listOrders } from "@/lib/orders-store";

export const runtime = "nodejs";

const extraRecipientSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
});

const bodySchema = z.object({
  articleTitle: z.string().min(3).max(200),
  articleUrl: z.string().url(),
  orderId: z.string().optional(),
  sendToAllPaid: z.boolean().optional().default(false),
  extras: z.array(extraRecipientSchema).optional().default([]),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isBlogMsg91Configured()) {
    return NextResponse.json(
      {
        error:
          "Blog WhatsApp not configured. Set MSG91_AUTH_KEY, MSG91_INTEGRATED_NUMBER, MSG91_BLOG_TEMPLATE_NAME.",
      },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { articleTitle, articleUrl, orderId, sendToAllPaid, extras } =
    parsed.data;

  const recipients: Array<{ name: string; phone: string }> = [];

  if (orderId) {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Order is not paid" },
        { status: 400 }
      );
    }
    recipients.push({ name: order.name, phone: order.phone });
  }

  if (sendToAllPaid) {
    const orders = await listOrders();
    for (const o of orders) {
      if (o.status !== "paid") continue;
      if (orderId && o.orderId === orderId) continue;
      recipients.push({ name: o.name, phone: o.phone });
    }
  }

  for (const e of extras) {
    recipients.push({ name: e.name, phone: e.phone });
  }

  if (!recipients.length) {
    return NextResponse.json(
      { error: "No recipients — pick an order, send to all paid, or add extras." },
      { status: 400 }
    );
  }

  // Single recipient — simpler response
  if (recipients.length === 1 && !sendToAllPaid && !extras.length) {
    const r = recipients[0];
    const sent = await sendBlogUpdateWhatsApp({
      phone: r.phone,
      name: r.name,
      articleTitle,
      articleUrl,
    });
    if (!sent.ok) {
      return NextResponse.json(
        { error: sent.error || "Send failed" },
        { status: 502 }
      );
    }
    return NextResponse.json({
      ok: true,
      sent: 1,
      failed: 0,
      articleTitle,
      articleUrl,
    });
  }

  const result = await sendBlogUpdateBulk(
    recipients,
    articleTitle,
    articleUrl
  );

  if (!result.sent) {
    return NextResponse.json(
      {
        error: result.errors[0] || "All sends failed",
        sent: result.sent,
        failed: result.failed,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    failed: result.failed,
    errors: result.errors.length ? result.errors : undefined,
    articleTitle,
    articleUrl,
  });
}
