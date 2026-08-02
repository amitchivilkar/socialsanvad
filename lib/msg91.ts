const MSG91_ENDPOINT =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

export function isMsg91Configured(): boolean {
  return Boolean(
    process.env.MSG91_AUTH_KEY &&
      process.env.MSG91_INTEGRATED_NUMBER &&
      process.env.MSG91_TEMPLATE_NAME
  );
}

type SendEbookParams = {
  phone: string;
  name: string;
  orderId: string;
  downloadUrl: string;
};

/**
 * Sends approved Utility template.
 * Default mapping: body_1=name, body_2=downloadUrl, body_3=orderId
 * Override with MSG91_BODY_* env if your template order differs.
 */
export async function sendEbookWhatsApp(
  params: SendEbookParams
): Promise<{ ok: boolean; error?: string }> {
  if (!isMsg91Configured()) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const authkey = process.env.MSG91_AUTH_KEY!;
  const integrated = process.env.MSG91_INTEGRATED_NUMBER!.replace(/\D/g, "");
  const templateName = process.env.MSG91_TEMPLATE_NAME!;
  const language = process.env.MSG91_TEMPLATE_LANGUAGE || "mr";
  const namespace = process.env.MSG91_TEMPLATE_NAMESPACE;

  const phone = params.phone.replace(/\D/g, "");
  const to = phone.length === 10 ? `91${phone}` : phone;

  const v1 = process.env.MSG91_VAR_1 || "name";
  const v2 = process.env.MSG91_VAR_2 || "downloadUrl";
  const v3 = process.env.MSG91_VAR_3 || "orderId";

  const values: Record<string, string> = {
    name: params.name,
    downloadUrl: params.downloadUrl,
    orderId: params.orderId,
  };

  const components: Record<
    string,
    { type: string; value: string }
  > = {
    body_1: { type: "text", value: values[v1] || params.name },
    body_2: { type: "text", value: values[v2] || params.downloadUrl },
    body_3: { type: "text", value: values[v3] || params.orderId },
  };

  const template: Record<string, unknown> = {
    name: templateName,
    language: {
      code: language,
      policy: "deterministic",
    },
    to_and_components: [
      {
        to: [to],
        components,
      },
    ],
  };

  if (namespace) {
    template.namespace = namespace;
  }

  const body = {
    integrated_number: integrated,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template,
    },
  };

  const res = await fetch(MSG91_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string })?.message ||
      `MSG91 failed (${res.status})`;
    console.error("[msg91]", message, data);
    return { ok: false, error: message };
  }

  return { ok: true };
}
