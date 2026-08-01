import type { Metadata } from "next";
import { Suspense } from "react";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "शोध",
  description: "Social Sanvad वर लेख, विषय आणि टॅग शोधा.",
  alternates: { canonical: "/shodh" },
  robots: { index: false, follow: true },
};

export default function ShodhPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-[var(--muted)]">लोड होत आहे…</div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
