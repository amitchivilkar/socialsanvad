"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Lock, MessageCircle, ShieldCheck, X } from "lucide-react";
import { siteConfig } from "@/lib/site";

type Props = {
  ebookSlug: string;
  ebookTitle?: string;
  coverImage?: string;
  ctaLabel: string;
  priceLabel: string;
};

export function BuyEbookButton({
  ebookSlug,
  ebookTitle = "कार्यकर्त्याची AI डायरी",
  coverImage = "/images/karykartyachi-ai-diary.png",
  ctaLabel,
  priceLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleId = useId();
  const nameId = useId();
  const phoneId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, loading]);

  function close() {
    if (loading) return;
    setOpen(false);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ebookSlug,
          name,
          phone,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "पेमेंट सुरू करता आलं नाही.");
      }

      const cashfree = await load({ mode: data.mode });
      await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "काहीतरी चुकलं.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--foreground)] px-8 text-base font-medium text-[var(--background)] transition-opacity hover:opacity-90 sm:w-auto"
      >
        {ctaLabel} · {priceLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={close}
        >
          <div
            className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-[var(--primary)]" aria-hidden />

            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 pb-5 pt-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  सुरक्षित खरेदी
                </p>
                <h3
                  id={titleId}
                  className="font-heading mt-1 text-xl font-semibold tracking-tight text-[var(--foreground)]"
                >
                  पेमेंट सुरू करा
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={loading}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] disabled:opacity-50"
                aria-label="बंद करा"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mx-6 mt-5 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50">
              <div className="flex gap-4 p-4">
                <div
                  className="relative aspect-[2/3] w-[72px] shrink-0 sm:w-[84px]"
                  style={{
                    filter:
                      "drop-shadow(0 10px 14px rgba(0,0,0,0.22)) drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
                  }}
                >
                  <Image
                    src={coverImage}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="84px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="text-xs font-medium text-[var(--muted)]">
                    ई-बुक · PDF
                  </p>
                  <p className="mt-1 font-heading text-base font-semibold leading-snug text-[var(--foreground)]">
                    {ebookTitle}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    WhatsApp वर मिळेल
                  </p>
                  <p className="font-heading mt-3 text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                    {priceLabel}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 py-5">
              <div>
                <label
                  htmlFor={nameId}
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  तुमचं नाव
                </label>
                <input
                  id={nameId}
                  required
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. अमित पाटील"
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
                />
              </div>

              <div>
                <label
                  htmlFor={phoneId}
                  className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                  WhatsApp नंबर
                </label>
                <div className="relative">
                  <span className="font-english absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
                    +91
                  </span>
                  <input
                    id={phoneId}
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))
                    }
                    className="font-english h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-14 pr-4 text-base text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/70 focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/10"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                  या नंबरवर PDF पाठवली जाईल
                </p>
              </div>

              {error ? (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
                By continuing you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-2 hover:text-[var(--foreground)]"
                >
                  Terms
                </Link>
                ,{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-[var(--foreground)]"
                >
                  Privacy
                </Link>{" "}
                and{" "}
                <Link
                  href="/refunds"
                  className="underline underline-offset-2 hover:text-[var(--foreground)]"
                >
                  Refund
                </Link>{" "}
                policies.
              </p>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] text-base font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--background)]/30 border-t-[var(--background)]" />
                    पेमेंट उघडत आहे…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" strokeWidth={1.75} />
                    सुरक्षित पेमेंट · {priceLabel}
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-[var(--border)] bg-[var(--secondary)]/40 px-6 py-4">
              <ul className="flex flex-col gap-2.5 text-xs text-[var(--muted)] sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-[var(--foreground)]"
                    strokeWidth={1.75}
                  />
                  Cashfree सुरक्षित पेमेंट
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Lock
                    className="h-3.5 w-3.5 text-[var(--foreground)]"
                    strokeWidth={1.75}
                  />
                  UPI / कार्ड / नेटबँकिंग
                </li>
              </ul>
              <nav
                aria-label="कायदेशीर"
                className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3"
              >
                {siteConfig.legal.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-xs text-[var(--muted)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
