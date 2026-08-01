"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  MessageCircle,
  Share2,
  Sparkles,
  Vote,
  Wrench,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { Container, SectionHeading } from "@/components/ui/container";

const iconMap = {
  Share2,
  Sparkles,
  MessageCircle,
  Vote,
  Wrench,
  BookOpen,
} as const;

export function FeaturedTopics() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="विषय"
          description="तुम्हाला काय हवंय?"
          href="/vishay"
          linkLabel="सगळे विषय"
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon =
              iconMap[cat.icon as keyof typeof iconMap] ?? Share2;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/vishay/${cat.slug}`}
                  className="group flex h-full gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition-colors hover:border-[var(--foreground)]/20 hover:bg-[var(--secondary)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--foreground)]">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
