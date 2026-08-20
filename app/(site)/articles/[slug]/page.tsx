import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAdjacentArticles,
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import { getCategoryName } from "@/lib/categories";
import { renderMDX } from "@/lib/mdx";
import { absoluteUrl, formatMarathiDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import {
  PrevNextNav,
  RelatedArticles,
} from "@/components/blog/related-articles";
import { Newsletter } from "@/components/home/newsletter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container, ProseContainer } from "@/components/ui/container";

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const title = article.seo?.title ?? article.title;
  const description = article.seo?.description ?? article.description;
  const url = absoluteUrl(`/articles/${article.slug}`);
  const ogImagePath = article.ogImage || "/images/logo.png";
  const ogImageAbsolute = absoluteUrl(ogImagePath);
  const hasCustomOg = Boolean(article.ogImage);

  return {
    title,
    description,
    keywords: article.seo?.keywords ?? article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      images: [
        {
          url: ogImagePath,
          width: hasCustomOg ? 1200 : 306,
          height: hasCustomOg ? 630 : 226,
          alt: title,
        },
      ],
    },
    twitter: {
      card: hasCustomOg ? "summary_large_image" : "summary",
      title,
      description,
      images: [ogImageAbsolute],
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const content = await renderMDX(article.content);
  const related = getRelatedArticles(article);
  const { prev, next } = getAdjacentArticles(article.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    image: article.ogImage ? absoluteUrl(article.ogImage) : undefined,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/logo.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
    inLanguage: "mr",
    articleSection: getCategoryName(article.category),
    keywords: article.tags.join(", "),
    wordCount: article.content.split(/\s+/).length,
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="overflow-x-clip pb-16 pt-10 sm:pt-14">
        <ProseContainer>
          <Breadcrumbs
            items={[
              { label: "होमपेज", href: "/" },
              { label: "लेख", href: "/articles" },
              {
                label: getCategoryName(article.category),
                href: `/topics/${article.category}`,
              },
              { label: article.title },
            ]}
          />

          <header className="border-b border-[var(--border)] pb-10">
            <p className="text-sm font-medium text-[var(--muted)]">
              <a
                href={`/topics/${article.category}`}
                className="hover:text-[var(--foreground)]"
              >
                {getCategoryName(article.category)}
              </a>
            </p>
            <h1 className="font-heading mt-3 wrap-break-word text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.75rem]">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {article.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
              <span>{article.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt}>
                {formatMarathiDate(article.publishedAt)}
              </time>
              <span aria-hidden>·</span>
              <span>{article.readingTime}</span>
            </div>
          </header>
        </ProseContainer>

        <Container className="mt-12">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0">
              <div id="article-content" className="mx-auto w-full max-w-[700px]">
                {content}
              </div>

              <div className="mx-auto mt-12 w-full max-w-[700px] space-y-10">
                <ShareButtons title={article.title} slug={article.slug} />
                <PrevNextNav prev={prev} next={next} />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <TableOfContents headings={article.headings} />
              </div>
            </aside>
          </div>
        </Container>
      </article>

      <RelatedArticles articles={related} />
      <Newsletter />
    </>
  );
}
