import { promises as fs } from "fs";
import path from "path";
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

export async function loadEbookPdf(): Promise<{
  buffer: Buffer;
  filename: string;
  contentType: string;
}> {
  const filename =
    process.env.EBOOK_PDF_FILENAME || "karykartyachi-ai-diary.pdf";

  const remote = process.env.EBOOK_PDF_URL;
  if (remote) {
    const res = await fetch(remote, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("PDF remote fetch failed");
    }
    const ab = await res.arrayBuffer();
    return {
      buffer: Buffer.from(ab),
      filename,
      contentType: "application/pdf",
    };
  }

  const relative =
    process.env.EBOOK_PDF_PATH ||
    path.join("private", "ebooks", "karykartyachi-ai-diary.pdf");
  const absolute = path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative);

  const buffer = await fs.readFile(absolute);
  return { buffer, filename, contentType: "application/pdf" };
}
