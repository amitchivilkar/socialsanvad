import { NextResponse } from "next/server";

/**
 * Cashfree payment webhook.
 * Payment यशस्वी झाल्यावर इथे PDF लिंक / ईमेल / WhatsApp फ्लो जोडता येईल.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[cashfree webhook]", JSON.stringify(payload));

    // TODO: verify signature with CASHFREE_SECRET_KEY
    // TODO: if PAYMENT_SUCCESS → send PDF download link

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
