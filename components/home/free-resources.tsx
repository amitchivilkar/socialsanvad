"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckSquare,
  FileText,
  Library,
  BookMarked,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/container";

const resources = [
  {
    title: "Prompt Library",
    description: "मेसेज, पोस्ट आणि भाषणासाठी तयार प्रॉम्प्ट्स",
    href: "/resources#prompts",
    icon: Library,
  },
  {
    title: "टेम्पलेट्स",
    description: "पोस्ट आणि WhatsApp साठी साधे टेम्पलेट्स",
    href: "/resources#templates",
    icon: FileText,
  },
  {
    title: "चेकलिस्ट्स",
    description: "कामाच्या छोट्या याद्या",
    href: "/resources#checklists",
    icon: CheckSquare,
  },
  {
    title: "मार्गदर्शिका",
    description: "स्टेप बाय स्टेप कसं करायचं",
    href: "/resources#guides",
    icon: BookMarked,
  },
];

export function FreeResources() {
  return (
    <section className="border-t border-[var(--border)] py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="मोफत साधने"
          description="आजच वापरता येतील अशा गोष्टी"
          href="/resources"
          linkLabel="सगळे साधने"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className="block h-full rounded-2xl border border-[var(--border)] p-6 transition-colors hover:bg-[var(--secondary)]"
              >
                <item.icon
                  className="h-6 w-6 text-[var(--foreground)]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 font-heading text-lg font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
