export type EbookPdfFile = {
  /** Filename inside private/ebooks/ (gitignored) — also used as download name. */
  filename: string;
  /** Label on the download page. */
  label: string;
  /**
   * Optional production URL (e.g. Drive uc?export=download&id=…).
   * Local/dev uses private/ebooks/{filename} when the file exists;
   * if missing, remoteUrl is used when set.
   */
  remoteUrl?: string;
};

export type Ebook = {
  slug: string;
  title: string;
  subtitle: string;
  priceInr: number;
  /** Display-only strike-through price. */
  compareAtInr?: number;
  cover: string;
  ctaLabel: string;
  pdfFiles: EbookPdfFile[];
  blurb: string;
  highlights: string[];
  badge?: string;
};

export const ebooks: Ebook[] = [
  {
    slug: "karykartyachi-ai-diary",
    title: "कार्यकर्त्याची AI डायरी",
    subtitle: "राजकीय कार्यकर्त्यांसाठी AI कंटेंट सिस्टम",
    priceInr: 125,
    compareAtInr: 299,
    cover: "/images/karyakartyachi-ai-diary-10.png",
    ctaLabel: "आत्ताच ई-बुक मिळवा",
    pdfFiles: [
      {
        filename: "karykartyachi-ai-diary.pdf",
        label: "AI डायरी 1.0 (PDF)",
        // Set EBOOK_PDF_URL for 1.0 remote override, or add remoteUrl here.
      },
    ],
    blurb:
      "“आज काय पोस्ट टाकू?” हा प्रश्न संपवा — ChatGPT ने पोस्ट, WhatsApp आणि रील स्क्रिप्ट्स.",
    highlights: [
      "१ प्रॉम्प्ट → ५ पोस्ट",
      "WhatsApp ब्रॉडकास्ट मार्गदर्शन",
      "३०-सेकंद रील स्क्रिप्ट्स",
      "५ दिवसांचा प्लॅन",
    ],
    badge: "1.0",
  },
  {
    slug: "karykartyachi-ai-diary-2",
    title: "कार्यकर्त्याची AI डायरी 2.0",
    subtitle: "अपग्रेडेड AI कंटेंट सिस्टम",
    priceInr: 149,
    compareAtInr: 299,
    cover: "/images/karyakartyachi-ai-diary-20.png",
    ctaLabel: "2.0 आत्ताच मिळवा",
    pdfFiles: [
      {
        filename: "karyakartyachi-ai-diary-2.0.pdf",
        label: "AI डायरी 2.0 (PDF)",
        remoteUrl:
          "https://drive.google.com/uc?export=download&id=1ykzgS1eSg6ZRoZzyCTv8s5zVRMenM7SS",
      },
    ],
    blurb:
      "नवीन edition — अधिक प्रॉम्प्ट्स, अपडेटेड पद्धती आणि कार्यकर्त्यांसाठी व्यावहारिक AI वर्कफ्लो.",
    highlights: [
      "2.0 अपडेटेड कंटेंट",
      "नवीन प्रॉम्प्ट्स व फॉरमॅट्स",
      "सोशल + WhatsApp फोकस",
      "लगेच PDF डाउनलोड",
    ],
    badge: "2.0",
  },
  {
    slug: "karykartyachi-ai-diary-bundle",
    title: "AI डायरी Bundle (1.0 + 2.0)",
    subtitle: "दोन्ही डायऱ्या एकत्र — बचत सहित",
    priceInr: 225,
    compareAtInr: 599,
    cover: "/images/karykartyachi-ai-diary-bundle.png",
    ctaLabel: "Bundle खरेदी करा",
    pdfFiles: [
      {
        filename: "karykartyachi-ai-diary.pdf",
        label: "AI डायरी 1.0 (PDF)",
      },
      {
        filename: "karyakartyachi-ai-diary-2.0.pdf",
        label: "AI डायरी 2.0 (PDF)",
        remoteUrl:
          "https://drive.google.com/uc?export=download&id=1ykzgS1eSg6ZRoZzyCTv8s5zVRMenM7SS",
      },
    ],
    blurb:
      "1.0 आणि 2.0 दोन्ही मिळवा. मूळ किंमत ₹599 — bundle मध्ये फक्त ₹225 (₹374 बचत).",
    highlights: [
      "दोन्ही PDFs एका खरेदीत",
      "₹374 बचत",
      "एक secure लिंक · ५ डाउनलोड",
      "पेमेंटनंतर लगेच उपलब्ध",
    ],
    badge: "Bundle",
  },
];

export function getEbook(slug: string): Ebook | undefined {
  return ebooks.find((e) => e.slug === slug);
}

export function getAllEbooks(): Ebook[] {
  return ebooks;
}

/** AI Diary family sold on one landing with version switch. */
export const AI_DIARY_LANDING_SLUG = "karykartyachi-ai-diary";

export type AiDiaryVersionKey = "1" | "2" | "bundle";

export const AI_DIARY_VERSION_SLUGS: Record<AiDiaryVersionKey, string> = {
  "1": "karykartyachi-ai-diary",
  "2": "karykartyachi-ai-diary-2",
  bundle: "karykartyachi-ai-diary-bundle",
};

export function parseAiDiaryVersion(
  raw: string | null | undefined
): AiDiaryVersionKey {
  if (raw === "2" || raw === "2.0") return "2";
  if (raw === "bundle" || raw === "both") return "bundle";
  return "1";
}

export function getAiDiaryVersions(): Ebook[] {
  return [
    AI_DIARY_VERSION_SLUGS["1"],
    AI_DIARY_VERSION_SLUGS["2"],
    AI_DIARY_VERSION_SLUGS.bundle,
  ]
    .map((slug) => getEbook(slug))
    .filter((e): e is Ebook => Boolean(e));
}

export function formatInr(amount: number): string {
  return `₹${amount}`;
}

/** Resolve a safe on-disk PDF for an order slug (+ optional file pick for bundles). */
export function resolveEbookPdfFile(
  ebookSlug: string,
  requestedFile?: string | null
): EbookPdfFile {
  const ebook = getEbook(ebookSlug);
  if (!ebook || ebook.pdfFiles.length === 0) {
    throw new Error(`Unknown ebook or missing PDFs: ${ebookSlug}`);
  }

  if (!requestedFile) {
    if (ebook.pdfFiles.length === 1) return ebook.pdfFiles[0];
    throw new Error("file query required for multi-PDF orders");
  }

  const base = requestedFile.replace(/^.*[/\\]/, "").trim();
  const match = ebook.pdfFiles.find((f) => f.filename === base);
  if (!match) {
    throw new Error(`PDF not in order: ${base}`);
  }
  return match;
}
