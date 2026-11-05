import { promises as fs } from "fs";
import path from "path";
import { resolveEbookPdfFile } from "@/lib/ebooks";
import {
  getDownloadUrl,
  markOrderPaidAndIssueToken,
  markWhatsappSent,
  type OrderRecord,
} from "@/lib/orders-store";
import { isMsg91Configured, sendEbookWhatsApp } from "@/lib/msg91";

export type FulfillResult = {
  order: OrderRecord | null;
  downloadUrl?: string;
  whatsappSent: boolean;
  whatsappError?: string;
};

/**
 * After PAID: issue secure token (max 5 downloads / 72h) and send WhatsApp once.
 */
export async function fulfillPaidOrder(orderId: string): Promise<FulfillResult> {
  const order = await markOrderPaidAndIssueToken(orderId);
  if (!order?.downloadToken) {
    return { order, whatsappSent: false, whatsappError: "Order not found" };
  }

  const downloadUrl = getDownloadUrl(order.downloadToken);

  if (order.whatsappSentAt) {
    return { order, downloadUrl, whatsappSent: true };
  }

  if (!isMsg91Configured()) {
    console.warn("[fulfill] MSG91 not configured — skip WhatsApp auto-send");
    return {
      order,
      downloadUrl,
      whatsappSent: false,
      whatsappError: "MSG91 not configured",
    };
  }

  const sent = await sendEbookWhatsApp({
    phone: order.phone,
    name: order.name,
    orderId: order.orderId,
    downloadUrl,
    downloadToken: order.downloadToken,
    ebookSlug: order.ebookSlug,
  });

  if (sent.ok) {
    await markWhatsappSent(order.orderId);
    return { order, downloadUrl, whatsappSent: true };
  }

  return {
    order,
    downloadUrl,
    whatsappSent: false,
    whatsappError: sent.error,
  };
}

/**
 * Load PDF for a paid order.
 * - Single-PDF products: ebookSlug is enough.
 * - Bundle: pass `file` = exact filename from catalog.
 * Legacy: EBOOK_PDF_URL / EBOOK_PDF_PATH only apply when loading the classic 1.0
 * file and those env vars are set (remote single-file override).
 */
export async function loadEbookPdf(
  ebookSlug: string,
  file?: string | null
): Promise<{
  buffer: Buffer;
  filename: string;
  contentType: string;
}> {
  const pdfMeta = resolveEbookPdfFile(ebookSlug, file);
  const filename = pdfMeta.filename;

  const isClassicV1 =
    ebookSlug === "karykartyachi-ai-diary" &&
    filename === "karykartyachi-ai-diary.pdf";

  const legacyRemote =
    isClassicV1 && process.env.EBOOK_PDF_URL
      ? process.env.EBOOK_PDF_URL
      : undefined;

  const relative =
    isClassicV1 && process.env.EBOOK_PDF_PATH
      ? process.env.EBOOK_PDF_PATH
      : path.join("private", "ebooks", filename);
  const absolute = path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative);

  try {
    const buffer = await fs.readFile(absolute);
    return { buffer, filename, contentType: "application/pdf" };
  } catch {
    /* fall through to remote */
  }

  const remote = legacyRemote || pdfMeta.remoteUrl;
  if (!remote) {
    throw new Error(`PDF missing locally and no remoteUrl: ${filename}`);
  }

  const res = await fetch(remote, { cache: "no-store", redirect: "follow" });
  if (!res.ok) {
    throw new Error(`PDF remote fetch failed (${res.status}): ${filename}`);
  }
  const ab = await res.arrayBuffer();
  return {
    buffer: Buffer.from(ab),
    filename:
      isClassicV1 && process.env.EBOOK_PDF_FILENAME
        ? process.env.EBOOK_PDF_FILENAME
        : filename,
    contentType: "application/pdf",
  };
}
