import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: ({ children, id, ...props }) => (
    <h2
      id={id}
      className="font-heading mt-14 mb-5 scroll-mt-28 text-2xl font-semibold tracking-tight text-[var(--foreground)] first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, id, ...props }) => (
    <h3
      id={id}
      className="font-heading mt-10 mb-3 scroll-mt-28 text-xl font-semibold tracking-tight text-[var(--foreground)]"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p
      className="my-6 text-[1.0625rem] leading-[1.85] text-[var(--foreground)]/90"
      {...props}
    >
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="underline decoration-[var(--border)] underline-offset-4 transition-colors hover:decoration-[var(--foreground)]"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="my-5 list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.8] text-[var(--foreground)]/90"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="my-5 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-[1.8] text-[var(--foreground)]/90"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-10 border-l-4 border-[var(--primary)] bg-[var(--primary-soft)] py-4 pl-5 pr-4 text-lg leading-relaxed text-[var(--foreground)] not-italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-[var(--foreground)]" {...props}>
      {children}
    </strong>
  ),
  hr: () => <hr className="my-10 border-[var(--border)]" />,
  table: ({ children, ...props }) => (
    <div className="my-8 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-[0.95rem]"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-b border-[var(--border)] px-3 py-2.5 font-heading font-semibold text-[var(--foreground)]"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="border-b border-[var(--border)] px-3 py-2.5 text-[var(--muted)]"
      {...props}
    >
      {children}
    </td>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="my-8 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 font-mono text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock =
      className?.includes("language-") || className?.includes("code-highlight");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-[0.875em] text-[var(--foreground)]"
        {...props}
      >
        {children}
      </code>
    );
  },
};
