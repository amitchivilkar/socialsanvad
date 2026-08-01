import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function AboutPreview() {
  return (
    <section className="border-t border-[var(--border)] py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_240px] lg:gap-16">
          <div>
            <p className="mb-3 text-sm font-medium text-[var(--muted)]">
              माझ्याबद्दल
            </p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              मी का लिहितो
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              {siteConfig.author.bio}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about" variant="secondary">
                अजून वाचा
              </Button>
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--foreground)] px-6 text-base font-medium text-[var(--background)] transition-opacity hover:opacity-90"
              >
                WhatsApp करा
              </a>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--secondary)] lg:max-w-none">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--primary)]" />
            <Image
              src="/images/about-placeholder.svg"
              alt="Social Sanvad"
              fill
              unoptimized
              className="object-cover"
              sizes="240px"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
