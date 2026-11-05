import Image from "next/image";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { BuyEbookButton } from "@/components/ebook/buy-ebook-button";
import { formatInr, type Ebook } from "@/lib/ebooks";

type Props = {
  ebook: Ebook;
  headline: string;
};

export function EbookOfferPage({ ebook, headline }: Props) {
  const price = formatInr(ebook.priceInr);
  const compareAt = ebook.compareAtInr
    ? formatInr(ebook.compareAtInr)
    : null;

  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)]">
        <div className="h-1 w-full bg-[var(--primary)]" aria-hidden />
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:h-16 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="Social Sanvad होमपेज"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={306}
              height={226}
              className="h-8 w-auto object-contain dark:invert"
              sizes="40px"
            />
            <span className="font-english text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
              Social Sanvad
            </span>
          </Link>
          <Link
            href="/ebook"
            className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline"
          >
            सर्व ई-बुक्स
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div className="relative mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="order-1 flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 md:order-2 md:py-16 lg:px-14">
            {ebook.badge ? (
              <p className="font-english text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {ebook.badge} · ई-बुक
              </p>
            ) : null}
            <h1 className="font-heading mt-3 text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.5rem]">
              {headline}
            </h1>
            <p className="mt-2 text-lg font-medium text-[var(--foreground)]">
              {ebook.title}
            </p>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              {ebook.blurb}
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <p className="font-heading text-3xl font-semibold tracking-tight">
                {price}
              </p>
              {compareAt ? (
                <p className="pb-1 text-base text-[var(--muted)] line-through">
                  {compareAt}
                </p>
              ) : null}
              <p className="pb-1 text-sm text-[var(--muted)]">
                ·{" "}
                {ebook.pdfFiles.length > 1
                  ? `${ebook.pdfFiles.length} PDFs`
                  : "PDF"}
              </p>
            </div>

            <div className="mt-6">
              <BuyEbookButton
                ebookSlug={ebook.slug}
                ebookTitle={ebook.title}
                coverImage={ebook.cover}
                ctaLabel={ebook.ctaLabel}
                priceLabel={price}
                variant="primary"
              />
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              पेमेंट झाल्यावर secure लिंक · जास्तीत जास्त ५ डाउनलोड · ७२ तास
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--muted)]">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              पेमेंट सुरक्षित · Cashfree
            </p>
          </div>

          <div className="relative order-2 flex items-center justify-center overflow-hidden bg-[var(--secondary)] px-6 py-10 sm:px-10 md:order-1 md:py-16">
            <div
              className="relative aspect-[2/3] w-[220px] sm:w-[260px]"
              style={{
                filter:
                  "drop-shadow(0 18px 28px rgba(0,0,0,0.28)) drop-shadow(0 6px 10px rgba(0,0,0,0.16))",
              }}
            >
              <Image
                src={ebook.cover}
                alt={ebook.title}
                fill
                priority
                className="object-contain"
                sizes="280px"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          यात काय मिळेल
        </h2>
        <ul className="mt-6 space-y-3">
          {ebook.highlights.map((item) => (
            <li key={item} className="flex gap-3 text-base text-[var(--foreground)]">
              <Check
                className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]"
                strokeWidth={2}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <BuyEbookButton
            ebookSlug={ebook.slug}
            ebookTitle={ebook.title}
            coverImage={ebook.cover}
            ctaLabel={ebook.ctaLabel}
            priceLabel={price}
            variant="primary"
          />
        </div>
      </section>
    </div>
  );
}
