import type { Category, CategorySlug } from "@/types";

export const categories: Category[] = [
  {
    slug: "social-media",
    name: "सोशल मीडिया",
    description: "Facebook, Instagram, YouTube वर कसं बोलायचं.",
    icon: "Share2",
  },
  {
    slug: "ai",
    name: "AI",
    description: "AI ने पोस्ट आणि संदेश कसे लिहायचे.",
    icon: "Sparkles",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    description: "गट आणि मेसेज व्यवस्थित कसे ठेवायचे.",
    icon: "MessageCircle",
  },
  {
    slug: "election",
    name: "निवडणूक",
    description: "निवडणुकीत ऑनलाइन कसं काम करायचं.",
    icon: "Vote",
  },
  {
    slug: "digital-tools",
    name: "डिजिटल साधने",
    description: "वेबसाइट आणि इतर कामाच्या गोष्टी.",
    icon: "Wrench",
  },
  {
    slug: "case-study",
    name: "खरी उदाहरणं",
    description: "खऱ्या मोहिमांमधून काय शिकायला मिळालं.",
    icon: "BookOpen",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: CategorySlug): string {
  return getCategory(slug)?.name ?? slug;
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return categories.some((c) => c.slug === slug);
}
