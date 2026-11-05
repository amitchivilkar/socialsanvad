import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Check, Zap } from "lucide-react";
import { DiaryHeroCover } from "@/components/ebook/diary-hero-cover";
import { DiaryVersionPicker } from "@/components/ebook/diary-version-picker";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AI_DIARY_LANDING_SLUG,
  getAiDiaryVersions,
  getEbook,
  parseAiDiaryVersion,
} from "@/lib/ebooks";
import { siteConfig } from "@/lib/site";

const SLUG = AI_DIARY_LANDING_SLUG;

/** Easy to update as sales grow */
const SOCIAL_PROOF_TEXT =
  "आतापर्यंत शेकडो कार्यकर्त्यांनी ही डायरी घेतली आहे";

export const metadata: Metadata = {
  title: "कार्यकर्त्याची AI डायरी | 1.0 · 2.0 · Bundle",
  description:
    "आज काय पोस्ट टाकू? हा प्रश्न संपवा. AI डायरी 1.0 (₹125), 2.0 (₹149) किंवा Bundle (₹225) — एकाच पेजवर निवडा.",
  openGraph: {
    title: "कार्यकर्त्याची AI डायरी",
    description: "1.0 · 2.0 · Bundle — AI कंटेंट सिस्टम",
    images: [{ url: "/images/karyakartyachi-ai-diary-10.png" }],
  },
  alternates: { canonical: `/ebook/${SLUG}` },
};

const benefits = [
  {
    title: "१ प्रॉम्प्ट → ५ पोस्ट",
    body: "एक विषय निवडा. एका मिनिटात ५ वेगळ्या प्रकारच्या पोस्ट तयार करा.",
  },
  {
    title: "WhatsApp ब्रॉडकास्ट",
    body: "फक्त फॉरवर्ड नका. लोकांच्या मनात जागा कशी करायची — ते शिका.",
  },
  {
    title: "३०-सेकंद रील स्क्रिप्ट्स",
    body: "कॅमेरा भीती असली तरी चालेल. AI स्क्रिप्ट वापरा आणि व्हिडिओ बनवा.",
  },
  {
    title: "मराठी + हिंग्लिश",
    body: "लोकांशी जोडणारी भाषा कशी वापरायची — सोपी स्ट्रॅटेजी.",
  },
  {
    title: "५ दिवसांचा प्लॅन",
    body: "आजपासून ५ दिवस — डिजिटल उपस्थिती सुधारण्याचा रोडमॅप.",
  },
];

const forWhom = [
  "सोशल मीडियावर ॲक्टिव्ह व्हायचंय",
  "धकाधकीतही ऑनलाइन उपस्थिती ठेवायचीय",
  "स्वतःचं काम-विचार लोकांपर्यंत पोहोचवायचंय",
];

const faqs = [
  {
    q: "PDF कसं मिळेल?",
    a: "पेमेंट झाल्यावर लगेच website वर secure download लिंक मिळते. त्या लिंकने PDF डाउनलोड करा.",
  },
  {
    q: "Refund मिळेल का?",
    a: null as string | null,
    href: "/refunds",
    linkLabel: "Refund policy",
    beforeLink: "डिजिटल प्रॉडक्ट असल्याने नियम वेगळे आहेत. सविस्तर माहिती ",
    afterLink: " पानावर वाचा.",
  },
  {
    q: "डायरी कोणत्या भाषेत आहे?",
    a: "संपूर्ण डायरी सोप्या, बोलण्यासारख्या मराठीत आहे.",
  },
  {
    q: "ChatGPT / AI ज्ञान लागेल का?",
    a: "नाही. डायरीत सोप्या सूचना आहेत — नवशिक्यांसाठीही चालेल.",
  },
  {
    q: "फोनवर वाचता / वापरता येईल का?",
    a: "हो. PDF फोन, टॅबलेट आणि कॉम्प्युटरवर उघडता येते.",
  },
  {
    q: "1.0, 2.0 की Bundle — काय घ्यावे?",
    a: "नवीन सुरू करत असाल तर 2.0 किंवा Bundle. Bundle मध्ये दोन्ही PDFs मिळतात आणि ₹49 बचत होते. फक्त मूळ डायरी हवी असल्यास 1.0 निवडा.",
  },
];

const painPoints = [
  "आज काय पोस्ट टाकू?",
  "लोक काय म्हणतील?",
  "वेळच मिळत नाही…",
  "इतरांसारखा कंटेंट कसा बनवू?",
];

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="h-1 w-8 rounded-full bg-[var(--primary)]" aria-hidden />
      <p className="text-sm font-medium text-[var(--muted)]">{children}</p>
    </div>
  );
}

function VersionCheckout(props: {
  versions: ReturnType<typeof getAiDiaryVersions>;
  initialVersion: ReturnType<typeof parseAiDiaryVersion>;
  align?: "start" | "center";
  showHighlights?: boolean;
  showDeliveryHints?: boolean;
  compact?: boolean;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--secondary)]" />
      }
    >
      <DiaryVersionPicker {...props} />
    </Suspense>
  );
}

export default async function EbookSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const ebook = getEbook(SLUG)!;
  const versions = getAiDiaryVersions();
  const { v } = await searchParams;
  const initialVersion = parseAiDiaryVersion(v);

  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)]">
        <div className="h-1 w-full bg-[var(--primary)]" aria-hidden />
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5 sm:h-16 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="Social Sanvad होमपेज"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={306}
              height={226}
              className="h-8 w-auto object-contain dark:invert"
              sizes="40px"
            />
            <span className="font-english text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
              Social Sanvad
            </span>
          </Link>
        </div>
      </div>

      {/* Hero: fit first viewport; Buy stays above the fold */}
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden border-b border-[var(--border)] sm:min-h-[calc(100dvh-4rem)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl flex-1 md:grid-cols-2 md:items-center">
          {/* Copy + checkout first so Buy is visible without scrolling on mobile */}
          <div className="order-1 flex flex-col justify-center px-5 py-5 sm:px-10 sm:py-8 md:order-2 md:py-10 lg:px-14">
            <p className="font-english text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:text-xs">
              Social Sanvad · ई-बुक
            </p>
            <h1 className="font-heading mt-2 text-2xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-[2.15rem]">
              “आज काय पोस्ट टाकू?” हा प्रश्न आता संपवा
            </h1>
            <p className="mt-2 hidden text-sm leading-snug text-[var(--muted)] sm:mt-3 sm:line-clamp-2 sm:block sm:text-base">
              राजकीय कार्यकर्त्यांसाठी AI कंटेंट सिस्टम — 1.0, 2.0 किंवा Bundle.
            </p>

            <p className="mt-3 inline-flex w-fit max-w-full items-center gap-2 truncate rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--foreground)] sm:text-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]"
                aria-hidden
              />
              <span className="truncate">{SOCIAL_PROOF_TEXT}</span>
            </p>

            <div className="mt-4" id="buy">
              <VersionCheckout
                versions={versions}
                initialVersion={initialVersion}
                compact
                showHighlights={false}
                showDeliveryHints={false}
              />
            </div>
          </div>

          <div className="relative order-2 hidden items-center justify-center overflow-hidden bg-[var(--secondary)] px-6 py-6 md:order-1 md:flex md:min-h-full md:py-10 lg:px-10">
            <div
              className="pointer-events-none absolute -left-16 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--primary)]/35 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 bottom-8 h-40 w-40 rounded-full bg-[var(--primary)]/25 blur-2xl"
              aria-hidden
            />
            <Suspense
              fallback={
                <div className="relative aspect-[2/3] w-full max-w-[280px] lg:max-w-[320px]">
                  <Image
                    src={ebook.cover}
                    alt={ebook.title}
                    fill
                    priority
                    className="object-contain object-center"
                    sizes="320px"
                  />
                </div>
              }
            >
              <DiaryHeroCover versions={versions} />
            </Suspense>
          </div>
        </div>
      </section>

      <Container className="pt-14 sm:pt-16">
        <FadeIn>
          <section>
            <SectionLabel>समस्या</SectionLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              ओळखीचं वाटतंय का?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              उत्साहाने सोशल मीडिया सुरू केलंत… पण काही दिवसांतच थकवा येतोय ना?
            </p>
            <ul className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              {painPoints.map((q) => (
                <li
                  key={q}
                  className="border-l-4 border-[var(--primary)] bg-[var(--secondary)] px-4 py-3.5 text-base text-[var(--foreground)]"
                >
                  “{q}”
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              समस्या तुमच्यात नाही — समस्या{" "}
              <strong className="font-semibold text-[var(--foreground)]">
                सिस्टीम
              </strong>{" "}
              नसल्यात आहे. मेहनतीपेक्षा स्मार्ट काम करायची वेळ आलीय.
            </p>
          </section>
        </FadeIn>

        <FadeIn delay={0.05}>
          <section className="relative mt-14 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--primary-soft)] p-6 sm:p-9">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[var(--primary)]/40 blur-2xl"
              aria-hidden
            />
            <div className="relative">
              <SectionLabel>उपाय</SectionLabel>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {ebook.title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--foreground)]/90 sm:text-lg">
                हे फक्त ई-बुक नाही — ही तुमची डिजिटल बोलण्याची सिस्टीम आहे. मेहनत
                कशी कमी करायची आणि पोहोच कशी वाढवायची, ते शिकाल!
              </p>
            </div>
          </section>
        </FadeIn>

        <section className="mt-16 sm:mt-20">
          <FadeIn>
            <SectionLabel>आत काय</SectionLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              यात काय मिळेल?
            </h2>
          </FadeIn>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((item, i) => (
              <FadeIn key={item.title} delay={0.04 * i}>
                <div className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 transition-colors hover:border-[var(--foreground)]/20 hover:bg-[var(--secondary)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] transition-transform group-hover:scale-105">
                    <Check
                      className="h-4 w-4 text-[var(--primary-foreground)]"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h3 className="font-heading mt-3 text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--muted)]">
                    {item.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-12 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--secondary)] px-6 py-8 sm:px-10">
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--muted)]">
                <Zap
                  className="h-3.5 w-3.5 text-[var(--foreground)]"
                  strokeWidth={1.75}
                />
                आत्ताच सुरू करा
              </p>
              <div className="mt-5 flex justify-center">
                <VersionCheckout
                  versions={versions}
                  initialVersion={initialVersion}
                  align="center"
                  showHighlights={false}
                  showDeliveryHints={false}
                />
              </div>
              <p className="mt-3 text-center text-sm text-[var(--muted)]">
                पेमेंट सुरक्षित · Cashfree · ५ डाउनलोड · ७२ तास
              </p>
            </div>
          </FadeIn>
        </section>

        <FadeIn>
          <section className="mt-16 border-t border-[var(--border)] pt-14 sm:mt-20">
            <SectionLabel>फरक</SectionLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              वेगळं का?
            </h2>
            <ul className="mt-8 max-w-2xl space-y-5">
              {[
                {
                  title: "कोडिंग नको.",
                  body: "सोपी मराठीत सांगितलंय.",
                },
                {
                  title: "खऱ्या समस्यांवर.",
                  body: "पाणी, रस्ते, स्थानिक प्रश्न — अशा दैनंदिन कामासाठी.",
                },
                {
                  title: "फक्त प्रेरणा नाही — सिस्टीम.",
                  body: "प्रेरणा तात्पुरती, सिस्टीम कायमची.",
                },
              ].map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span className="font-heading flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)]">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                    <strong className="text-[var(--foreground)]">
                      {item.title}
                    </strong>{" "}
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="mt-16 sm:mt-20">
            <SectionLabel>तुमच्यासाठी</SectionLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              हे कोणासाठी?
            </h2>
            <ul className="mt-8 space-y-3">
              {forWhom.map((item) => (
                <li
                  key={item}
                  className="flex max-w-xl items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/70 px-4 py-3.5 text-base sm:text-lg"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]"
                    aria-hidden
                  >
                    <Check
                      className="h-3.5 w-3.5 text-[var(--primary-foreground)]"
                      strokeWidth={2.5}
                    />
                  </span>
                  <span className="text-[var(--foreground)]">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="mt-16 border-t border-[var(--border)] pt-14 sm:mt-20">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              वारंवार विचारले जाणारे प्रश्न
            </h2>
            <div className="mt-8 max-w-2xl divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {faqs.map((item) => (
                <div key={item.q} className="py-5">
                  <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-[var(--muted)]">
                    {"href" in item && item.href ? (
                      <>
                        {item.beforeLink}
                        <Link
                          href={item.href}
                          className="underline underline-offset-4 hover:text-[var(--foreground)]"
                        >
                          {item.linkLabel}
                        </Link>
                        {item.afterLink}
                      </>
                    ) : (
                      item.a
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="relative mt-16 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--primary-soft)] px-5 py-14 text-center sm:mt-20 sm:px-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              aria-hidden
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(17,17,17,0.08) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-1 w-24 -translate-x-1/2 rounded-full bg-[var(--primary)]"
              aria-hidden
            />
            <div className="relative">
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                वेळ वाया घालवू नका. स्मार्ट वर्क सुरू करा.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted)] sm:text-lg">
                1.0, 2.0 किंवा Bundle निवडा — आजच डिजिटल सिस्टीम सुरू करा.
              </p>
              <div className="mt-6 flex justify-center">
                <VersionCheckout
                  versions={versions}
                  initialVersion={initialVersion}
                  align="center"
                  showHighlights={false}
                />
              </div>
              <p className="mt-6 text-sm text-[var(--muted)]">
                प्रश्न?{" "}
                <a
                  href={siteConfig.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-[var(--foreground)]"
                >
                  WhatsApp करा
                </a>
              </p>
            </div>
          </section>
        </FadeIn>

        <nav
          aria-label="कायदेशीर"
          className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]"
        >
          {siteConfig.legal.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--foreground)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </div>
  );
}
