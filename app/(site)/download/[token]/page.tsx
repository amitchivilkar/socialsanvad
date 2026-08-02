import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  assertCanDownload,
  MAX_DOWNLOADS,
} from "@/lib/orders-store";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download ebook",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function DownloadPage({ params }: Props) {
  const { token } = await params;
  if (!token) notFound();

  const gate = await assertCanDownload(token);

  if (!gate.ok) {
    return (
      <Container className="flex flex-col items-center py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          डाउनलोड उपलब्ध नाही
        </h1>
        <p className="mt-4 max-w-md text-base text-[var(--muted)]">
          {gate.message}
        </p>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="mt-8 text-sm underline underline-offset-4"
        >
          {siteConfig.contact.email}
        </a>
        <Link
          href="/contact"
          className="mt-4 text-sm text-[var(--muted)] underline-offset-4 hover:underline"
        >
          Contact page
        </Link>
      </Container>
    );
  }

  const remaining = MAX_DOWNLOADS - gate.order.downloadCount;

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">Secure download</p>
      <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        तुमची PDF तयार आहे
      </h1>
      <p className="mt-4 max-w-md text-base text-[var(--muted)] sm:text-lg">
        ही लिंक फक्त तुमच्या खरेदीसाठी आहे. जास्तीत जास्त {MAX_DOWNLOADS} वेळा
        डाउनलोड करता येईल.
      </p>
      <p className="font-english mt-2 text-sm text-[var(--muted)]">
        Remaining: {remaining} / {MAX_DOWNLOADS}
      </p>

      <a
        href={`/api/download/${token}`}
        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-8 text-base font-medium text-[var(--background)]"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
        PDF डाउनलोड करा
      </a>

      <p className="mt-6 max-w-sm text-xs text-[var(--muted)]">
        लिंक शेअर करू नका. कालबाह्य / मर्यादा संपल्यास{" "}
        <Link href="/contact" className="underline underline-offset-2">
          संपर्क
        </Link>{" "}
        साधा.
      </p>
    </Container>
  );
}
