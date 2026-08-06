import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { isMsg91Configured, sendEbookWhatsApp } from "@/lib/msg91";
import {
  getDownloadUrl,
  getOrder,
  markWhatsappSent,
  renewDownloadLink,
} from "@/lib/orders-store";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderId: z.string().min(3),
  /** If true (default), renew expired/missing links before send */
  renewIfNeeded: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isMsg91Configured()) {
    return NextResponse.json(
      { error: "MSG91 not configured on server" },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  const { orderId, renewIfNeeded } = parsed.data;
  let order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "paid") {
    return NextResponse.json(
      { error: "Order is not paid" },
      { status: 400 }
    );
  }

  const expired =
    order.downloadExpiresAt &&
    new Date(order.downloadExpiresAt).getTime() < Date.now();

  let downloadUrl: string | null = order.downloadToken
    ? getDownloadUrl(order.downloadToken)
    : null;
  let renewed = false;

  if ((!order.downloadToken || expired) && renewIfNeeded) {
    const result = await renewDownloadLink(orderId);
    if (!result) {
      return NextResponse.json(
        { error: "Could not issue download link" },
        { status: 500 }
      );
    }
    order = result.order;
    downloadUrl = result.downloadUrl;
    renewed = true;
  }

  if (!downloadUrl || !order.downloadToken) {
    return NextResponse.json(
      { error: "No download link — renew first" },
      { status: 400 }
    );
  }

  const sent = await sendEbookWhatsApp({
    phone: order.phone,
    name: order.name,
    orderId: order.orderId,
    downloadUrl,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: sent.error || "WhatsApp send failed", downloadUrl, renewed },
      { status: 502 }
    );
  }

  await markWhatsappSent(order.orderId);

  return NextResponse.json({
    ok: true,
    downloadUrl,
    renewed,
    whatsappSentAt: new Date().toISOString(),
  });
}
