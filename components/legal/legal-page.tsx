import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

type Props = {
  title: string;
  description: string;
  updatedAt: string;
  children: React.ReactNode;
};

export function LegalPage({ title, description, updatedAt, children }: Props) {
  return (
    <div className="py-12 sm:py-16">
      <Container>
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: title }]}
        />

        <article className="mx-auto max-w-2xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">
            {description}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Last updated: {updatedAt} · {siteConfig.name}
          </p>

          <div className="mt-10 space-y-8 text-base leading-relaxed text-[var(--foreground)]/90 sm:text-lg [&_h2]:font-heading [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-[var(--foreground)] [&_h2]:sm:text-2xl [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-[var(--foreground)]">
            {children}
          </div>
        </article>
      </Container>
    </div>
  );
}
