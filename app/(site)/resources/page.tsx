import type { Metadata } from "next";
import {
  BookMarked,
  CheckSquare,
  FileText,
  Library,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Container } from "@/components/ui/container";
import { Newsletter } from "@/components/home/newsletter";

export const metadata: Metadata = {
  title: "साधने",
  description: "तयार प्रॉम्प्ट्स, टेम्पलेट्स आणि यादी — मोफत आणि कामाच्या.",
  alternates: { canonical: "/resources" },
};

const sections = [
  {
    id: "prompts",
    title: "Prompt Library",
    icon: Library,
    items: [
      "WhatsApp मेसेज लिहिण्यासाठी प्रॉम्प्ट",
      "Instagram Reel साठी प्रॉम्प्ट",
      "भाषण सोपं करण्यासाठी प्रॉम्प्ट",
      "गावातल्या समस्येची पोस्ट — प्रॉम्प्ट",
    ],
  },
  {
    id: "templates",
    title: "टेम्पलेट्स",
    icon: FileText,
    items: [
      "आठवड्याचं पोस्ट प्लॅनिंग",
      "कार्यक्रमाची जाहिरात",
      "यशाची पोस्ट",
      "कार्यकर्त्यांसाठी सूचना",
    ],
  },
  {
    id: "checklists",
    title: "चेकलिस्ट्स",
    icon: CheckSquare,
    items: [
      "सोशल मीडिया प्रोफाइल तपासणी",
      "निवडणुकीआधी ३० दिवस",
      "WhatsApp गट सेटअप",
      "अफवा आली तर काय करायचं",
    ],
  },
  {
    id: "guides",
    title: "मार्गदर्शिका",
    icon: BookMarked,
    items: [
      "नव्याने सुरू करणाऱ्यांसाठी",
      "कार्यकर्ते कसे शिकवायचे",
      "अकाउंट सुरक्षित कसं ठेवायचं",
      "फोनवर व्हिडिओ कसा काढायचा",
    ],
  },
];

export default function SansadhanePage() {
  return (
    <>
      <div className="py-12 sm:py-16">
        <Container>
          <Breadcrumbs
            items={[{ label: "होमपेज", href: "/" }, { label: "साधने" }]}
          />
          <header className="mb-12 max-w-2xl">
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              साधने
            </h1>
            <p className="mt-3 text-lg text-[var(--muted)]">
              आजच वापरता येतील अशा गोष्टी — मोफत
            </p>
          </header>

          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]">
                    <section.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h2 className="font-heading text-2xl font-semibold">
                    {section.title}
                  </h2>
                </div>
                <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center justify-between gap-4 py-4"
                    >
                      <span className="text-base text-[var(--foreground)]">
                        {item}
                      </span>
                      <span className="shrink-0 rounded-full bg-[var(--secondary)] px-3 py-1 text-xs text-[var(--muted)]">
                        लवकरच
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </div>
      <Newsletter />
    </>
  );
}
