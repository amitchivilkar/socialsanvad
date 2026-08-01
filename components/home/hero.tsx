"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--primary)]" aria-hidden />

      <Container className="relative py-20 sm:py-28 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="font-english mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[var(--primary)]"
              aria-hidden
            />
            Social Sanvad
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.25rem]">
            राजकारणात ऑनलाइन कसं बोलायचं — इथे शिकायला मिळेल
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            नेते, कार्यकर्ते आणि संस्थांसाठी सोशल मीडिया, AI, WhatsApp आणि
            वेबसाइट — सोप्या मराठीतून, खऱ्या अनुभवातून.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/articles" variant="primary" size="lg">
              लेख वाचा
            </Button>
            <Button href="/about" variant="secondary" size="lg">
              माझ्याबद्दल
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
