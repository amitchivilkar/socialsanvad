import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "main" | "nav" | "header" | "footer";
}) {
  return (
    <Tag className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </Tag>
  );
}

export function ProseContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto min-w-0 w-full max-w-[700px] px-5 sm:px-8", className)}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <a
          href={href}
          className="shrink-0 text-sm font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
        >
          {linkLabel} →
        </a>
      ) : null}
    </div>
  );
}
