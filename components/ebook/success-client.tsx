"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { trackMetaEvent } from "@/lib/meta-pixel";

type Props = {
  orderId?: string;
  initiallyPaid: boolean;
  status: string;
};

export function SuccessClient({ orderId, initiallyPaid, status }: Props) {
  const [paid, setPaid] = useState(initiallyPaid);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const purchaseTracked = useRef(false);

  useEffect(() => {
    if (!initiallyPaid || purchaseTracked.current) return;
    purchaseTracked.current = true;

    const storageKey = orderId
      ? `meta_purchase_${orderId}`
      : "meta_purchase_unknown";

    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      /* ignore */
    }

    trackMetaEvent("Purchase", {
      value: 125,
      currency: "INR",
      content_name: "कार्यकर्त्याची AI डायरी",
      content_ids: ["karykartyachi-ai-diary"],
      content_type: "product",
      order_id: orderId,
    });

    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }, [initiallyPaid, orderId]);

  useEffect(() => {
    if (!orderId || !initiallyPaid) return;

    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await fetch("/api/ebook/fulfill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.paid) setPaid(true);
        if (data.downloadUrl) setDownloadUrl(data.downloadUrl);
        if (data.whatsappSent) {
          setWhatsappSent(true);
          setNote("PDF लिंक WhatsApp वर पाठवली आहे.");
        } else if (data.downloadUrl) {
          setNote(
            data.whatsappError
              ? "WhatsApp auto-send अजून सेट नाही — खालील secure link वापरा."
              : "खालील secure link ने PDF डाउनलोड करा."
          );
        }
      } catch {
        if (!cancelled) setNote("लिंक तयार करताना अडचण आली. थोड्या वेळाने refresh करा.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId, initiallyPaid]);

  const waMessage = encodeURIComponent(
    `नमस्कार! मी "कार्यकर्त्याची AI डायरी" घेतली.${orderId ? ` Order: ${orderId}` : ""} PDF हवी आहे.`
  );
  const waHref = `${siteConfig.social.whatsapp}?text=${waMessage}`;

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm font-medium text-[var(--muted)]">ई-बुक</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {paid ? "पेमेंट झालं!" : "धन्यवाद"}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
        {paid
          ? whatsappSent
            ? "PDF ची secure लिंक WhatsApp वर पाठवली आहे. खालीही डाउनलोड करू शकता."
            : "तुमची secure डाउनलोड लिंक तयार होत आहे…"
          : "पेमेंट प्रोसेस होत असेल. थोड्या वेळाने ही पेज refresh करा."}
      </p>

      {orderId ? (
        <p className="font-english mt-3 text-xs text-[var(--muted)]">
          Order: {orderId}
          {status ? ` · ${status}` : ""}
        </p>
      ) : null}

      {note ? (
        <p className="mt-3 max-w-md text-sm text-[var(--muted)]">{note}</p>
      ) : null}

      {downloadUrl ? (
        <a
          href={downloadUrl}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--foreground)] px-8 text-base font-medium text-[var(--background)]"
        >
          Secure PDF डाउनलोड
        </a>
      ) : null}

      {busy && !downloadUrl ? (
        <p className="mt-8 text-sm text-[var(--muted)]">तयार करत आहोत…</p>
      ) : null}

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-6 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--secondary)]"
      >
        WhatsApp सपोर्ट
      </a>

      <Link
        href="/ebook/karykartyachi-ai-diary"
        className="mt-4 text-sm text-[var(--muted)] underline-offset-4 hover:underline"
      >
        ← ई-बुक पेजवर जा
      </Link>
    </div>
  );
}
