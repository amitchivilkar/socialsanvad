import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { formatInr, getEbook } from "@/lib/ebooks";

export function EbookTeaser() {
  const ebook = getEbook("karykartyachi-ai-diary");
  if (!ebook) return null;

  return (
    <section className="border-t border-[var(--border)] py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-8 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 p-6 sm:grid-cols-[140px_1fr] sm:gap-10 sm:p-8">
          <div
            className="relative mx-auto aspect-[2/3] w-[140px] sm:mx-0 sm:w-full"
            style={{
              filter:
                "drop-shadow(0 14px 20px rgba(0,0,0,0.22)) drop-shadow(0 4px 8px rgba(0,0,0,0.14))",
            }}
          >
            <Image
              src={ebook.cover}
              alt=""
              fill
              className="object-contain object-center"
              sizes="160px"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">ई-बुक</p>
            <h2 className="font-heading mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {ebook.title}
            </h2>
            <p className="mt-2 max-w-xl text-base text-[var(--muted)]">
              “आज काय पोस्ट टाकू?” हा प्रश्न संपवा — फक्त {formatInr(ebook.priceInr)}
            </p>
            <Link
              href={`/ebook/${ebook.slug}`}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--foreground)] px-6 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
            >
              अधिक जाणून घ्या
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
