import { NextResponse } from "next/server";
import { z } from "zod";
import { createCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import { getEbook } from "@/lib/ebooks";
import { savePendingOrder } from "@/lib/orders-store";
import { siteConfig } from "@/lib/site";

const bodySchema = z.object({
  ebookSlug: z.string().min(1),
  name: z.string().min(2).max(80),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    if (!isCashfreeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Cashfree अजून सेट नाही. .env मध्ये CASHFREE_APP_ID आणि CASHFREE_SECRET_KEY टाका.",
        },
        { status: 503 }
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "नाव आणि WhatsApp नंबर बरोबर भरा." },
        { status: 400 }
      );
    }

    const { ebookSlug, name, phone, email } = parsed.data;
    const ebook = getEbook(ebookSlug);
    if (!ebook) {
      return NextResponse.json({ error: "ई-बुक सापडलं नाही." }, { status: 404 });
    }

    const orderId = `ss_${ebook.slug.slice(0, 12)}_${Date.now()}`;
    const base = siteConfig.url.replace(/\/$/, "");
    const returnUrl = `${base}/ebook/success?order_id=${orderId}`;
    const notifyUrl = `${base}/api/cashfree/webhook`;

    await savePendingOrder({
      orderId,
      ebookSlug,
      name: name.trim(),
      phone: phone.trim(),
    });

    const order = await createCashfreeOrder({
      orderId,
      amountInr: ebook.priceInr,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email?.trim() || undefined,
      returnUrl,
      notifyUrl,
    });

    return NextResponse.json({
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      mode:
        process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "पेमेंट सुरू करता आलं नाही.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
