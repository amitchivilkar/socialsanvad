"use client";

import { Check, Copy } from "lucide-react";
import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

export function CopyablePre({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const text = preRef.current?.innerText?.replace(/\n$/, "") ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group relative my-8">
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)]/95 px-2.5 text-xs font-medium text-[var(--foreground)] shadow-sm backdrop-blur-sm transition-opacity hover:bg-[var(--secondary)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        aria-label={copied ? "Copied" : "Copy prompt"}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
            Copy
          </>
        )}
      </button>
      <pre
        ref={preRef}
        className={[
          "overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-4 pt-11 font-mono text-sm leading-relaxed sm:pt-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
