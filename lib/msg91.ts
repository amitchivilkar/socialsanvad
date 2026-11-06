import { getEbook } from "@/lib/ebooks";

const MSG91_ENDPOINT =
  "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";

/** Same WABA namespace as blog templates unless overridden. */
const DEFAULT_EBOOK_NAMESPACE = "3c119cfc_8dca_4e60_b53d_28e9458ff7c2";

export function isMsg91Configured(): boolean {
  return Boolean(
    process.env.MSG91_AUTH_KEY &&
      process.env.MSG91_INTEGRATED_NUMBER &&
      (process.env.MSG91_TEMPLATE_V1 ||
        process.env.MSG91_TEMPLATE_V2 ||
        process.env.MSG91_TEMPLATE_BUNDLE ||
        process.env.MSG91_TEMPLATE_NAME)
  );
}

function siteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.socialsanvad.com"
  ).replace(/\/$/, "");
}

/** Absolute HTTPS cover URL for WhatsApp header image. */
export function ebookHeaderImageUrl(ebookSlug: string): string {
  const override = process.env.MSG91_EBOOK_HEADER_IMAGE?.trim();
  if (override) return override;

  const ebook = getEbook(ebookSlug);
  const cover = ebook?.cover?.trim();
  if (cover?.startsWith("http://") || cover?.startsWith("https://")) {
    return cover;
  }
  if (cover?.startsWith("/")) {
    return `${siteBaseUrl()}${cover}`;
  }

  return `${siteBaseUrl()}/images/karyakartyachi-ai-diary-10.png`;
}

/** Map order ebookSlug → approved download template name. */
export function ebookTemplateForSlug(ebookSlug: string): string {
  const v1 = process.env.MSG91_TEMPLATE_V1 || "ebook_download_v1";
  const v2 = process.env.MSG91_TEMPLATE_V2 || "ebook_download_v2";
  const bundle =
    process.env.MSG91_TEMPLATE_BUNDLE || "ebook_download_bundle";
  const legacy = process.env.MSG91_TEMPLATE_NAME;

  if (ebookSlug === "karykartyachi-ai-diary-2") return v2;
  if (ebookSlug === "karykartyachi-ai-diary-bundle") return bundle;
  if (ebookSlug === "karykartyachi-ai-diary") return v1;
  return legacy || v1;
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

type TemplateComponent = {
  type: string;
  value: string;
  /** Required for Visit website dynamic buttons (Meta). */
  sub_type?: string;
};

type TemplateRecipient = {
  phone: string;
  components: Record<string, TemplateComponent>;
};

type Msg91BulkResponse = {
  status?: string;
  hasError?: boolean;
  message?: string;
  errors?: unknown;
  request_id?: string;
  data?: unknown;
};

function msg91SoftError(data: Msg91BulkResponse): string | null {
  if (data.hasError === true) {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message.trim();
    }
    if (typeof data.data === "string" && data.data.trim()) {
      return data.data.trim();
    }
    if (data.errors != null) {
      try {
        return JSON.stringify(data.errors);
      } catch {
        return "MSG91 hasError=true";
      }
    }
    return "MSG91 hasError=true";
  }

  const status = (data.status || "").toLowerCase();
  if (status && status !== "success") {
    return (
      (typeof data.message === "string" && data.message.trim()) ||
      (typeof data.data === "string" && data.data.trim()) ||
      `MSG91 status=${data.status}`
    );
  }

  return null;
}

async function sendWhatsAppTemplate(input: {
  templateName: string;
  language: string;
  namespace?: string;
  recipients: TemplateRecipient[];
}): Promise<{ ok: boolean; error?: string; requestId?: string }> {
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_INTEGRATED_NUMBER) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const authkey = process.env.MSG91_AUTH_KEY;
  const integrated = process.env.MSG91_INTEGRATED_NUMBER.replace(/\D/g, "");
  const phones = input.recipients.map((r) => normalizePhone(r.phone));

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

  console.log("[msg91] send", {
    template: input.templateName,
    language: input.language,
    namespace: input.namespace || null,
    to: phones,
  });

  const res = await fetch(MSG91_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as Msg91BulkResponse;

  if (!res.ok) {
    const message =
      data.message ||
      (typeof data.data === "string" ? data.data : null) ||
      `MSG91 failed (${res.status})`;
    console.error("[msg91] http error", message, data);
    return { ok: false, error: message };
  }

  const soft = msg91SoftError(data);
  if (soft) {
    console.error("[msg91] soft error", soft, data);
    return { ok: false, error: soft, requestId: data.request_id };
  }

  console.log("[msg91] accepted", {
    template: input.templateName,
    requestId: data.request_id || null,
    to: phones,
  });

  return { ok: true, requestId: data.request_id };
}

type SendEbookParams = {
  phone: string;
  name: string;
  orderId: string;
  downloadUrl: string;
  /** Secure path token — used when button expects URL suffix only. */
  downloadToken: string;
  ebookSlug: string;
};

/**
 * Post-purchase download WhatsApp.
 *
 * Approved MSG91 shape (ebook_download_*):
 *   namespace + header_1 (image) + body_1 (name) + body_2 (orderId)
 *   Dynamic Visit-website button: set MSG91_EBOOK_INCLUDE_BUTTON=true and
 *   send button_1 as type "text" (Meta rejects type "url" on button params).
 *
 * Legacy (MSG91_EBOOK_LEGACY_BODY_URL=true):
 *   body_1=name, body_2=downloadUrl, body_3=orderId — no header/button
 */
export async function sendEbookWhatsApp(
  params: SendEbookParams
): Promise<{ ok: boolean; error?: string }> {
  if (!isMsg91Configured()) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const templateName = ebookTemplateForSlug(params.ebookSlug);
  const language = process.env.MSG91_TEMPLATE_LANGUAGE || "mr";
  const namespace =
    process.env.MSG91_TEMPLATE_NAMESPACE?.trim() || DEFAULT_EBOOK_NAMESPACE;
  const legacyBodyUrl = process.env.MSG91_EBOOK_LEGACY_BODY_URL === "true";

  const name = params.name.trim() || "मित्र";
  const orderId = params.orderId.trim();
  const downloadUrl = params.downloadUrl.trim();
  const token = params.downloadToken.trim();

  let components: Record<string, TemplateComponent>;

  if (legacyBodyUrl) {
    const v1 = process.env.MSG91_VAR_1 || "name";
    const v2 = process.env.MSG91_VAR_2 || "downloadUrl";
    const v3 = process.env.MSG91_VAR_3 || "orderId";
    const values: Record<string, string> = {
      name,
      downloadUrl,
      orderId,
    };
    components = {
      body_1: { type: "text", value: values[v1] || name },
      body_2: { type: "text", value: values[v2] || downloadUrl },
      body_3: { type: "text", value: values[v3] || orderId },
    };
  } else {
    const headerUrl = ebookHeaderImageUrl(params.ebookSlug);
    const body2Mode = (
      process.env.MSG91_EBOOK_BODY_2 || "orderId"
    ).toLowerCase();
    const body2 =
      body2Mode === "downloadurl" || body2Mode === "url"
        ? downloadUrl
        : orderId;

    components = {
      header_1: { type: "image", value: headerUrl },
      body_1: { type: "text", value: name },
      body_2: { type: "text", value: body2 },
    };

    // Dynamic Visit website {{1}}: Meta wants param type "text" + button sub_type "url".
    if (process.env.MSG91_EBOOK_INCLUDE_BUTTON === "true") {
      const buttonMode = (
        process.env.MSG91_EBOOK_BUTTON_MODE || "suffix"
      ).toLowerCase();
      components.button_1 = {
        type: "text",
        sub_type: "url",
        value: buttonMode === "full" ? downloadUrl : token,
      };
    }
  }

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
