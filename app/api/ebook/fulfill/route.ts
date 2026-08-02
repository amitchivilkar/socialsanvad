import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { getOrder } from "@/lib/orders-store";

const bodySchema = z.object({
  orderId: z.string().min(3),
});

/**
 * Success-page fallback: if webhook was delayed, fulfill on PAID check.
 */
export async function POST(request: Request) {
  try {
    if (!isCashfreeConfigured()) {
      return NextResponse.json({ error: "Cashfree not configured" }, { status: 503 });
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const { orderId } = parsed.data;
    const cf = await fetchCashfreeOrder(orderId);
    const paid = ["PAID", "SUCCESS"].includes(cf.order_status.toUpperCase());
    if (!paid) {
      return NextResponse.json({
        paid: false,
        status: cf.order_status,
      });
    }

    const existing = await getOrder(orderId);
    if (!existing) {
      return NextResponse.json(
        {
          paid: true,
          fulfilled: false,
          error: "Order record missing — webhook/create-order store required",
        },
        { status: 404 }
      );
    }

    const result = await fulfillPaidOrder(orderId);

    return NextResponse.json({
      paid: true,
      fulfilled: true,
      downloadUrl: result.downloadUrl,
      whatsappSent: result.whatsappSent,
      whatsappError: result.whatsappError,
      downloadsRemaining:
        result.order && result.order.downloadToken
          ? Math.max(0, 5 - result.order.downloadCount)
          : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fulfill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
