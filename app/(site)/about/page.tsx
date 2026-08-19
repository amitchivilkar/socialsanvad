import type { Metadata } from "next";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Newsletter } from "@/components/home/newsletter";

export const metadata: Metadata = {
  title: "माझ्याबद्दल",
  description: siteConfig.author.bio,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="py-12 sm:py-16">
        <Container>
          <Breadcrumbs
            items={[
              { label: "होमपेज", href: "/" },
              { label: "माझ्याबद्दल" },
            ]}
          />

          <div className="mx-auto max-w-2xl">
            <div className="relative mx-auto mb-10 aspect-square w-40 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--secondary)] sm:w-48">
              <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-[var(--primary)]" />
              <Image
                src="/images/about-placeholder.svg"
                alt="Social Sanvad"
                fill
                unoptimized
                className="object-cover"
                sizes="192px"
              />
            </div>

            <h1 className="font-heading text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              मी का लिहितो
            </h1>
            <p className="font-english mt-2 text-center text-sm text-[var(--muted)]">
              Social Sanvad
            </p>

            <div className="mt-10 space-y-5 text-lg leading-relaxed text-[var(--foreground)]/90">
              <p>{siteConfig.author.bio}</p>
              <p>
                काही जण आम्हाला "Social Samvad" असंही शोधतात — तेच आम्ही
                आहोत.
              </p>
              <p>
                ही जाहिरात कंपनी नाही. इथे खरं अनुभव आहे — चुका, यश आणि सोपे उपाय.
              </p>
              <p>
                एकच हेतू: महाराष्ट्रातल्या नेत्यांना, कार्यकर्त्यांना आणि संस्थांना
                ऑनलाइन बोलणं सोपं आणि खरं बनवायचं.
              </p>
              <p>
                काही विचारायचं असेल किंवा फक्त नमस्कार करायचा असेल — WhatsApp वर
                लिहा.
              </p>
            </div>

            <div className="mt-10 flex justify-center">
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--foreground)] px-7 text-base font-medium text-[var(--background)] transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                WhatsApp करा
              </a>
            </div>
          </div>
        </Container>
      </div>
      <Newsletter />
    </>
  );
}
