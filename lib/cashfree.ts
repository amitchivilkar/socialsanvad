const CASHFREE_BASE =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";

export function isCashfreeConfigured(): boolean {
  return Boolean(
    process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY
  );
}

export function getCashfreeMode(): "sandbox" | "production" {
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

type CreateOrderInput = {
  orderId: string;
  amountInr: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  returnUrl: string;
  notifyUrl?: string;
};

export async function createCashfreeOrder(input: CreateOrderInput) {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secret) {
    throw new Error("Cashfree keys missing");
  }

  const res = await fetch(`${CASHFREE_BASE}/pg/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": appId,
      "x-client-secret": secret,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: input.amountInr,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${input.customerPhone.replace(/\D/g, "").slice(-10)}`,
        customer_phone: input.customerPhone.replace(/\D/g, "").slice(-10),
        customer_name: input.customerName,
        customer_email:
          input.customerEmail ||
          `${input.customerPhone.replace(/\D/g, "").slice(-10)}@socialsanvad.buyer`,
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      order_note: "karykartyachi-ai-diary",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || "Cashfree order create failed"
    );
  }

  return data as {
    order_id: string;
    payment_session_id: string;
    order_status: string;
  };
}

export async function fetchCashfreeOrder(orderId: string) {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secret) {
    throw new Error("Cashfree keys missing");
  }

  const res = await fetch(`${CASHFREE_BASE}/pg/orders/${orderId}`, {
    headers: {
      "x-client-id": appId,
      "x-client-secret": secret,
      "x-api-version": "2023-08-01",
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Order fetch failed");
  }

  return data as {
    order_id: string;
    order_status: string;
    order_amount: number;
  };
}
