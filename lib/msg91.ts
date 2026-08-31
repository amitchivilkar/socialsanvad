const MSG91_ENDPOINT =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

export function isMsg91Configured(): boolean {
  return Boolean(
    process.env.MSG91_AUTH_KEY &&
      process.env.MSG91_INTEGRATED_NUMBER &&
      process.env.MSG91_TEMPLATE_NAME
  );
}

export function isBlogMsg91Configured(): boolean {
  return Boolean(
    process.env.MSG91_AUTH_KEY &&
      process.env.MSG91_INTEGRATED_NUMBER &&
      (process.env.MSG91_BLOG_TEMPLATE_NAME || "bloglinksupdate")
  );
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

type TemplateRecipient = {
  phone: string;
  components: Record<string, { type: string; value: string }>;
};

async function sendWhatsAppTemplate(input: {
  templateName: string;
  language: string;
  namespace?: string;
  recipients: TemplateRecipient[];
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_INTEGRATED_NUMBER) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const authkey = process.env.MSG91_AUTH_KEY;
  const integrated = process.env.MSG91_INTEGRATED_NUMBER.replace(/\D/g, "");

  const template: Record<string, unknown> = {
    name: input.templateName,
    language: {
      code: input.language,
      policy: "deterministic",
    },
    to_and_components: input.recipients.map((r) => ({
      to: [normalizePhone(r.phone)],
      components: r.components,
    })),
  };

  if (input.namespace) {
    template.namespace = input.namespace;
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

type SendEbookParams = {
  phone: string;
  name: string;
  orderId: string;
  downloadUrl: string;
};

/**
 * Sends approved Utility template.
 * Default mapping: body_1=name, body_2=downloadUrl, body_3=orderId
 * Override with MSG91_VAR_* env if your template order differs.
 */
export async function sendEbookWhatsApp(
  params: SendEbookParams
): Promise<{ ok: boolean; error?: string }> {
  if (!isMsg91Configured()) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const templateName = process.env.MSG91_TEMPLATE_NAME!;
  const language = process.env.MSG91_TEMPLATE_LANGUAGE || "mr";
  const namespace = process.env.MSG91_TEMPLATE_NAMESPACE;

  const v1 = process.env.MSG91_VAR_1 || "name";
  const v2 = process.env.MSG91_VAR_2 || "downloadUrl";
  const v3 = process.env.MSG91_VAR_3 || "orderId";

  const values: Record<string, string> = {
    name: params.name,
    downloadUrl: params.downloadUrl,
    orderId: params.orderId,
  };

  const components: Record<string, { type: string; value: string }> = {
    body_1: { type: "text", value: values[v1] || params.name },
    body_2: { type: "text", value: values[v2] || params.downloadUrl },
    body_3: { type: "text", value: values[v3] || params.orderId },
  };

  return sendWhatsAppTemplate({
    templateName,
    language,
    namespace,
    recipients: [{ phone: params.phone, components }],
  });
}

export type BlogUpdateRecipient = {
  phone: string;
  name: string;
};

type SendBlogParams = {
  phone: string;
  name: string;
  articleTitle: string;
  articleUrl: string;
};

/**
 * Marketing template: bloglinksupdate
 * body_1=name, body_2=article title, body_3=article URL
 */
export async function sendBlogUpdateWhatsApp(
  params: SendBlogParams
): Promise<{ ok: boolean; error?: string }> {
  if (!isBlogMsg91Configured()) {
    return { ok: false, error: "Blog MSG91 template not configured" };
  }

  const templateName =
    process.env.MSG91_BLOG_TEMPLATE_NAME || "bloglinksupdate";
  const language = process.env.MSG91_BLOG_TEMPLATE_LANGUAGE || "mr";
  const namespace = process.env.MSG91_BLOG_TEMPLATE_NAMESPACE;

  const components = {
    body_1: { type: "text", value: params.name.trim() || "मित्र" },
    body_2: { type: "text", value: params.articleTitle.trim() },
    body_3: { type: "text", value: params.articleUrl.trim() },
  };

  return sendWhatsAppTemplate({
    templateName,
    language,
    namespace,
    recipients: [{ phone: params.phone, components }],
  });
}

/** Send blog update to many recipients (batched API calls). */
export async function sendBlogUpdateBulk(
  recipients: BlogUpdateRecipient[],
  articleTitle: string,
  articleUrl: string
): Promise<{
  ok: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const title = articleTitle.trim();
  const url = articleUrl.trim();
  if (!title || !url) {
    return { ok: false, sent: 0, failed: 0, errors: ["Missing title or URL"] };
  }

  const unique = new Map<string, BlogUpdateRecipient>();
  for (const r of recipients) {
    const key = normalizePhone(r.phone);
    if (key.length >= 12) unique.set(key, r);
  }

  const list = [...unique.values()];
  if (!list.length) {
    return { ok: false, sent: 0, failed: 0, errors: ["No recipients"] };
  }

  const templateName =
    process.env.MSG91_BLOG_TEMPLATE_NAME || "bloglinksupdate";
  const language = process.env.MSG91_BLOG_TEMPLATE_LANGUAGE || "mr";
  const namespace = process.env.MSG91_BLOG_TEMPLATE_NAMESPACE;

  const BATCH = 25;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < list.length; i += BATCH) {
    const batch = list.slice(i, i + BATCH);
    const result = await sendWhatsAppTemplate({
      templateName,
      language,
      namespace,
      recipients: batch.map((r) => ({
        phone: r.phone,
        components: {
          body_1: { type: "text", value: r.name.trim() || "मित्र" },
          body_2: { type: "text", value: title },
          body_3: { type: "text", value: url },
        },
      })),
    });

    if (result.ok) {
      sent += batch.length;
    } else {
      failed += batch.length;
      if (result.error) errors.push(result.error);
    }
  }

  return {
    ok: failed === 0,
    sent,
    failed,
    errors,
  };
}
