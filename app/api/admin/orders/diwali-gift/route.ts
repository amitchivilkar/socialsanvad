import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  isDiwaliGiftConfigured,
  sendDiwaliGiftWhatsApp,
} from "@/lib/msg91";
import {
  getOrder,
  isDiwaliGiftEligible,
  issueDiwaliGiftOrder,
  listOrders,
  markDiwaliGiftSent,
} from "@/lib/orders-store";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderId: z.string().optional(),
  /** All paid 1.0 buyers who have not received the gift yet. */
  sendToEligible: z.boolean().optional().default(false),
  /** Resend even if diwaliGiftSentAt is set. */
  forceResend: z.boolean().optional().default(false),
});

async function sendOne(
  orderId: string,
  forceResend: boolean
): Promise<{
  orderId: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
  giftOrderId?: string;
  downloadUrl?: string;
}> {
  const source = await getOrder(orderId);
  if (!source) {
    return { orderId, ok: false, error: "Order not found" };
  }
  if (!isDiwaliGiftEligible(source)) {
    return {
      orderId,
      ok: false,
      error: "Not eligible (need paid 1.0 order)",
    };
  }
  if (source.diwaliGiftSentAt && !forceResend) {
    return {
      orderId,
      ok: true,
      skipped: true,
      giftOrderId: source.diwaliGiftOrderId,
    };
  }

  const issued = await issueDiwaliGiftOrder(orderId);
  if (!issued?.gift.downloadToken) {
    return { orderId, ok: false, error: "Could not issue gift download" };
  }

  const sent = await sendDiwaliGiftWhatsApp({
    phone: issued.source.phone,
    name: issued.source.name,
    downloadUrl: issued.downloadUrl,
    downloadToken: issued.gift.downloadToken,
  });

  if (!sent.ok) {
    return {
      orderId,
      ok: false,
      error: sent.error || "WhatsApp send failed",
      giftOrderId: issued.gift.orderId,
      downloadUrl: issued.downloadUrl,
    };
  }

  await markDiwaliGiftSent(issued.source.orderId, issued.gift.orderId);

  return {
    orderId,
    ok: true,
    giftOrderId: issued.gift.orderId,
    downloadUrl: issued.downloadUrl,
  };
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDiwaliGiftConfigured()) {
    return NextResponse.json(
      {
        error:
          "Diwali gift WhatsApp not configured. Set MSG91_AUTH_KEY and MSG91_INTEGRATED_NUMBER.",
      },
      { status: 503 }
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { orderId, sendToEligible, forceResend } = parsed.data;

  if (!orderId && !sendToEligible) {
    return NextResponse.json(
      { error: "Provide orderId or sendToEligible=true" },
      { status: 400 }
    );
  }

  const targets: string[] = [];

  if (orderId) {
    targets.push(orderId);
  }

  if (sendToEligible) {
    const orders = await listOrders();
    const phones = new Set<string>();
    for (const o of orders) {
      if (!isDiwaliGiftEligible(o)) continue;
      if (o.diwaliGiftSentAt && !forceResend) continue;
      if (orderId && o.orderId === orderId) continue;
      const phone = o.phone.replace(/\D/g, "").slice(-10);
      if (phones.has(phone)) continue;
      phones.add(phone);
      targets.push(o.orderId);
    }
  }

  if (!targets.length) {
    return NextResponse.json(
      {
        error: forceResend
          ? "No eligible paid 1.0 orders found"
          : "No eligible recipients left (all gifted, or no paid 1.0 orders)",
      },
      { status: 400 }
    );
  }

  const results = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const id of targets) {
    const result = await sendOne(id, forceResend);
    results.push(result);
    if (result.skipped) skipped += 1;
    else if (result.ok) sent += 1;
    else {
      failed += 1;
      if (result.error) errors.push(`${id}: ${result.error}`);
    }
  }

  if (!sent && !skipped) {
    return NextResponse.json(
      {
        error: errors[0] || "All Diwali gift sends failed",
        sent,
        skipped,
        failed,
        results,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    failed,
    errors: errors.length ? errors : undefined,
    results,
  });
}
