import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SuccessClient } from "@/components/ebook/success-client";
import { fetchCashfreeOrder, isCashfreeConfigured } from "@/lib/cashfree";

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

  return (
    <Container className="py-24">
      <SuccessClient
        orderId={orderId}
        initiallyPaid={paid}
        status={status}
      />
    </Container>
  );
}
