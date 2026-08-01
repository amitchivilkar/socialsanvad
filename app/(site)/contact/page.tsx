import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact ${siteConfig.name} — email and phone for support and queries.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, phone, phoneDisplay } = siteConfig.contact;

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: "होमपेज", href: "/" },
            { label: "संपर्क" },
          ]}
        />

        <div className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            प्रश्न, सपोर्ट किंवा ई-बुक खरेदीबद्दल काही विचारायचं असेल तर खालील
            संपर्क वापरा.
          </p>

          <div className="mt-10 space-y-4">
            <a
              href={`mailto:${email}`}
              className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 px-5 py-5 transition-colors hover:border-[var(--foreground)]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-medium text-[var(--muted)]">
                  Email
                </span>
                <span className="font-english mt-1 block text-lg font-semibold text-[var(--foreground)]">
                  {email}
                </span>
              </span>
            </a>

            <a
              href={`tel:${phone}`}
              className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 px-5 py-5 transition-colors hover:border-[var(--foreground)]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                <Phone className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-sm font-medium text-[var(--muted)]">
                  Mobile / Contact number
                </span>
                <span className="font-english mt-1 block text-lg font-semibold text-[var(--foreground)]">
                  {phoneDisplay}
                </span>
              </span>
            </a>
          </div>

          <div className="mt-10 space-y-3 text-base leading-relaxed text-[var(--foreground)]/90">
            <p>
              <strong>{siteConfig.name}</strong> ({siteConfig.nameMr}) — डिजिटल
              संवाद, लेख आणि ई-बुक्स.
            </p>
            <p className="text-[var(--muted)]">
              आम्ही शक्य तितक्या लवकर उत्तर देण्याचा प्रयत्न करतो. ई-बुक ऑर्डर /
              पेमेंट संबंधित विषयांसाठी ईमेलमध्ये ऑर्डर तपशील लिहा.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
