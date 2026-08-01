import { Hero } from "@/components/home/hero";
import { FeaturedTopics } from "@/components/home/featured-topics";
import { LatestArticles } from "@/components/home/latest-articles";
import { EbookTeaser } from "@/components/home/ebook-teaser";
import { Newsletter } from "@/components/home/newsletter";
import { AboutPreview } from "@/components/home/about-preview";
import { FadeIn } from "@/components/ui/fade-in";
import { getAllArticles } from "@/lib/articles";

export default function HomePage() {
  const latest = getAllArticles().slice(0, 4);

  return (
    <>
      <Hero />
      <FadeIn>
        <FeaturedTopics />
      </FadeIn>
      <FadeIn delay={0.05}>
        <LatestArticles articles={latest} />
      </FadeIn>
      <FadeIn>
        <EbookTeaser />
      </FadeIn>
      <FadeIn delay={0.05}>
        <Newsletter />
      </FadeIn>
      <FadeIn>
        <AboutPreview />
      </FadeIn>
    </>
  );
}
