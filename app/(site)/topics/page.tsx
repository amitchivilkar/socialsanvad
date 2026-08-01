import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  Share2,
  Sparkles,
  Vote,
  Wrench,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/articles";
import { toMarathiDigits } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "विषय",
  description: "सोशल मीडिया, AI, WhatsApp, निवडणूक — सगळे विषय एकत्र.",
  alternates: { canonical: "/topics" },
};

const iconMap = {
  Share2,
  Sparkles,
  MessageCircle,
  Vote,
  Wrench,
  BookOpen,
} as const;

export default function VishayPage() {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs
          items={[{ label: "होमपेज", href: "/" }, { label: "विषय" }]}
        />
        <header className="mb-12 max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            विषय
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            तुम्हाला काय हवंय ते निवडा
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => {
            const Icon =
              iconMap[cat.icon as keyof typeof iconMap] ?? Share2;
            const count = getArticlesByCategory(cat.slug).length;
            return (
              <Link
                key={cat.slug}
                href={`/topics/${cat.slug}`}
                className="rounded-2xl border border-[var(--border)] p-6 transition-colors hover:bg-[var(--secondary)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h2 className="font-heading mt-4 text-xl font-semibold">
                  {cat.name}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
                  {cat.description}
                </p>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {toMarathiDigits(count)} लेख
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
