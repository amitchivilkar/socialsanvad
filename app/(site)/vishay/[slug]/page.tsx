import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, isValidCategorySlug } from "@/lib/categories";
import { getArticlesByCategory } from "@/lib/articles";
import { toMarathiDigits } from "@/lib/utils";
import { ArticleCard } from "@/components/blog/article-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/vishay/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidCategorySlug(slug)) notFound();

  const category = getCategory(slug)!;
  const articles = getArticlesByCategory(slug);

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: "होमपेज", href: "/" },
            { label: "विषय", href: "/vishay" },
            { label: category.name },
          ]}
        />
        <header className="mb-12 max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-3 text-lg text-[var(--muted)]">
            {category.description}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {toMarathiDigits(articles.length)} लेख
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="text-[var(--muted)]">या विषयावर अजून लेख नाहीत.</p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
