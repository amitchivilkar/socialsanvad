import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/blog/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { toMarathiDigits } from "@/lib/utils";

export const metadata: Metadata = {
  title: "लेख",
  description:
    "सोशल मीडिया, AI, WhatsApp आणि निवडणुकीबद्दल सोप्या मराठीतले लेख.",
  alternates: { canonical: "/articles" },
};

export default function LekhaPage() {
  const articles = getAllArticles();

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs items={[{ label: "होमपेज", href: "/" }, { label: "लेख" }]} />
        <header className="mb-12 max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            लेख
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            अनुभवातून शिकलेलं — {toMarathiDigits(articles.length)} लेख
          </p>
        </header>

        <div className="mx-auto max-w-3xl space-y-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>
    </div>
  );
}
