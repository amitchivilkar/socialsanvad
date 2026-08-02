import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { BuyEbookButton } from "@/components/ebook/buy-ebook-button";
import { Container } from "@/components/ui/container";
import { formatInr, getEbook } from "@/lib/ebooks";
import { siteConfig } from "@/lib/site";

const SLUG = "karykartyachi-ai-diary";

export const metadata: Metadata = {
  title: "कार्यकर्त्याची AI डायरी | ई-बुक",
  description:
    "आज काय पोस्ट टाकू? हा प्रश्न संपवा. राजकीय कार्यकर्त्यांसाठी AI कंटेंट सिस्टम — फक्त ₹125.",
  openGraph: {
    title: "कार्यकर्त्याची AI डायरी",
    description: "AI कंटेंट सिस्टम — फक्त ₹125",
    images: [{ url: "/images/karykartyachi-ai-diary.png" }],
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

export default function EbookSalesPage() {
  const ebook = getEbook(SLUG);
  if (!ebook) notFound();

  const price = formatInr(ebook.priceInr);

  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)]">
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
              priority
            />
            <span className="font-english text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
              Social Sanvad
            </span>
          </Link>
        </div>
      </div>

      {/* Hero 50 / 50 */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="flex items-center justify-center bg-[var(--secondary)] px-6 py-10 sm:px-10 sm:py-14">
            <div
              className="relative aspect-[2/3] w-full max-w-[380px]"
              style={{
                filter:
                  "drop-shadow(0 25px 35px rgba(0,0,0,0.28)) drop-shadow(0 8px 12px rgba(0,0,0,0.18)) drop-shadow(12px 18px 24px rgba(0,0,0,0.12))",
              }}
            >
              <Image
                src={ebook.cover}
                alt={ebook.title}
                fill
                priority
                className="object-contain object-center"
                sizes="(max-width: 768px) 90vw, 380px"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-14">
            <p className="text-sm font-medium text-[var(--muted)]">ई-बुक</p>
            <h1 className="font-heading mt-3 text-3xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl">
              “आज काय पोस्ट टाकू?” हा प्रश्न आता संपवा
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
              राजकीय कार्यकर्त्यांसाठी तयार AI कंटेंट सिस्टम — जी रोजचा ताण कमी
              करेल आणि लोकांपर्यंत पोहोच वाढवेल.
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <p className="font-heading text-4xl font-semibold tabular-nums text-[var(--foreground)]">
                {price}
              </p>
              <p className="pb-1 text-sm text-[var(--muted)]">एकदाच · PDF</p>
            </div>

            <div className="mt-6">
              <BuyEbookButton
                ebookSlug={ebook.slug}
                ebookTitle={ebook.title}
                coverImage={ebook.cover}
                ctaLabel={ebook.ctaLabel}
                priceLabel={price}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--muted)]">
              पेमेंट सुरक्षित · Cashfree · PDF WhatsApp वर
            </p>
          </div>
        </div>
      </section>

      <Container className="pt-14 sm:pt-16">
        <section>
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            ओळखीचं वाटतंय का?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            उत्साहाने सोशल मीडिया सुरू केलंत… पण काही दिवसांतच थकवा येतोय ना?
          </p>
          <ul className="mt-6 max-w-xl space-y-3 text-base text-[var(--foreground)]">
            {[
              "आज काय पोस्ट टाकू?",
              "लोक काय म्हणतील?",
              "वेळच मिळत नाही…",
              "इतरांसारखा कंटेंट कसा बनवू?",
            ].map((q) => (
              <li
                key={q}
                className="rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60 px-4 py-3"
              >
                “{q}”
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            समस्या तुमच्यात नाही — समस्या{" "}
            <strong className="font-semibold text-[var(--foreground)]">
              सिस्टीम
            </strong>{" "}
            नसल्यात आहे. मेहनतीपेक्षा स्मार्ट काम करायची वेळ आलीय.
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-[var(--border)] bg-[var(--primary-soft)] p-6 sm:p-8">
          <p className="text-sm font-medium text-[var(--muted)]">उपाय</p>
          <h2 className="font-heading mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {ebook.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--foreground)]/90 sm:text-lg">
            हे फक्त ई-बुक नाही — ही तुमची डिजिटल बोलण्याची सिस्टीम आहे. मेहनत कशी
            कमी करायची आणि पोहोच कशी वाढवायची, ते शिकवाल.
          </p>
        </section>

        <section className="mt-16 sm:mt-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            यात काय मिळेल?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[var(--border)] p-5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]">
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
            ))}
          </div>
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-14 sm:mt-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            वेगळं का?
          </h2>
          <ul className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            <li>
              <strong className="text-[var(--foreground)]">कोडिंग नको.</strong>{" "}
              सोपी मराठीत सांगितलंय.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                खऱ्या समस्यांवर.
              </strong>{" "}
              पाणी, रस्ते, स्थानिक प्रश्न — अशा दैनंदिन कामासाठी.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                फक्त प्रेरणा नाही — सिस्टीम.
              </strong>{" "}
              प्रेरणा तात्पुरती, सिस्टीम कायमची.
            </li>
          </ul>
        </section>

        <section className="mt-16 sm:mt-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            हे कोणासाठी?
          </h2>
          <ul className="mt-6 space-y-3">
            {forWhom.map((item) => (
              <li key={item} className="flex gap-3 text-base sm:text-lg">
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]"
                  aria-hidden
                />
                <span className="text-[var(--foreground)]">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-[var(--border)] pt-14 text-center sm:mt-20">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            वेळ वाया घालवू नका. स्मार्ट वर्क सुरू करा.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-[var(--muted)] sm:text-lg">
            आजच {ebook.title} घ्या आणि तुमची डिजिटल सिस्टीम तयार करा.
          </p>
          <p className="font-heading mt-6 text-3xl font-semibold">{price}</p>
          <div className="mt-6 flex justify-center">
            <BuyEbookButton
              ebookSlug={ebook.slug}
              ebookTitle={ebook.title}
              coverImage={ebook.cover}
              ctaLabel={ebook.ctaLabel}
              priceLabel={price}
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
          <nav
            aria-label="कायदेशीर"
            className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)]"
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
        </section>
      </Container>
    </div>
  );
}
