import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { fetchCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "पेमेंट यशस्वी",
  robots: { index: false, follow: false },
};

export default async function EbookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId } = await searchParams;

  let paid = false;
  let status = "";

  if (orderId && isCashfreeConfigured()) {
    try {
      const order = await fetchCashfreeOrder(orderId);
      status = order.order_status;
      paid = ["PAID", "SUCCESS"].includes(order.order_status.toUpperCase());
    } catch {
      status = "UNKNOWN";
    }
  }

  const waMessage = encodeURIComponent(
    `नमस्कार! मी "कार्यकर्त्याची AI डायरी" घेतली.${orderId ? ` Order: ${orderId}` : ""} PDF हवी आहे.`
  );
  const waHref = `${siteConfig.social.whatsapp}?text=${waMessage}`;

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">ई-बुक</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {paid ? "पेमेंट झालं!" : "धन्यवाद"}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
        {paid
          ? "आता खालील बटण दाबा — WhatsApp वर PDF मिळेल."
          : "पेमेंट प्रोसेस होत असेल. थोड्या वेळाने WhatsApp वर लिहा, आम्ही PDF पाठवू."}
      </p>

      {orderId ? (
        <p className="font-english mt-3 text-xs text-[var(--muted)]">
          Order: {orderId}
          {status ? ` · ${status}` : ""}
        </p>
      ) : null}

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-8 text-base font-medium text-[var(--background)]"
      >
        WhatsApp वर PDF मागा
      </a>

      <Link
        href="/ebook/karykartyachi-ai-diary"
        className="mt-4 text-sm text-[var(--muted)] underline-offset-4 hover:underline"
      >
        ← ई-बुक पेजवर जा
      </Link>
    </Container>
  );
}
