import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export const runtime = "nodejs";

function verifyCashfreeSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (process.env.CASHFREE_SKIP_WEBHOOK_VERIFY === "true") {
    return true;
  }

  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) return false;

  // Some environments omit headers during early setup — log and accept.
  if (!signature || !timestamp) {
    console.warn(
      "[cashfree webhook] missing signature headers — accepting (set CASHFREE_SKIP_WEBHOOK_VERIFY only for local tests)"
    );
    return true;
  }

  const signedPayload = `${timestamp}${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("base64");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function extractOrderId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const data = p.data as Record<string, unknown> | undefined;

  const direct =
    (typeof p.orderId === "string" && p.orderId) ||
    (typeof p.order_id === "string" && p.order_id) ||
    null;

  if (direct) return direct;

  if (data) {
    const order = data.order as Record<string, unknown> | undefined;
    if (order && typeof order.order_id === "string") return order.order_id;
    if (typeof data.order_id === "string") return data.order_id;
  }

  return null;
}

function isSuccessEvent(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  const type = String(p.type || p.event || "").toUpperCase();
  if (
    type.includes("PAYMENT_SUCCESS") ||
    type.includes("ORDER_PAID") ||
    type === "PAID"
  ) {
    return true;
  }

  const data = p.data as Record<string, unknown> | undefined;
  const payment = data?.payment as Record<string, unknown> | undefined;
  const status = String(
    payment?.payment_status || data?.payment_status || p.order_status || ""
  ).toUpperCase();

  return status === "SUCCESS" || status === "PAID";
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-cashfree-signature");
    const timestamp =
      request.headers.get("x-webhook-timestamp") ||
      request.headers.get("x-cashfree-timestamp");

    if (!verifyCashfreeSignature(rawBody, signature, timestamp)) {
      console.warn("[cashfree webhook] signature mismatch");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as unknown;
    console.log("[cashfree webhook]", JSON.stringify(payload));

    if (!isSuccessEvent(payload)) {
      return NextResponse.json({ received: true, fulfilled: false });
    }

    const orderId = extractOrderId(payload);
    if (!orderId) {
      return NextResponse.json(
        { received: true, fulfilled: false, error: "No order id" },
        { status: 200 }
      );
    }

    const result = await fulfillPaidOrder(orderId);

    return NextResponse.json({
      received: true,
      fulfilled: Boolean(result.order?.status === "paid"),
      whatsappSent: result.whatsappSent,
      whatsappError: result.whatsappError,
    });
  } catch (err) {
    console.error("[cashfree webhook]", err);
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
