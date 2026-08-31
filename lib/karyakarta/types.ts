export type OccasionCategory =
  | "national"
  | "maharashtra"
  | "religious"
  | "cultural"
  | "jayanti"
  | "punyatithi"
  | "social"
  | "person"
  | "political"
  | "local"
  | "custom";

export type PostType =
  | "special-day"
  | "birthday"
  | "jayanti"
  | "punyatithi"
  | "congratulations"
  | "event"
  | "social-work"
  | "custom"
  | "festival";

export type DateType = "fixed" | "variable" | "manual" | "recurring";

export type VisualTheme =
  | "devotional"
  | "patriotic"
  | "tribute"
  | "celebratory"
  | "formal"
  | "social"
  | "festival"
  | "modern";

export interface CalendarOccasion {
  id: string;
  title: string;
  slug: string;
  /** YYYY-MM-DD for a specific year occurrence, or MM-DD for fixed annual */
  date: string;
  dateType: DateType;
  category: OccasionCategory;
  description: string;
  defaultGreeting: string;
  visualTheme: VisualTheme;
  recommendedStyle: string;
  templateIds: string[];
  isActive: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  postType: PostType;
  categories: OccasionCategory[];
  aspectRatio: "1080x1350";
  photoPosition: "bottom-right" | "bottom-left" | "center-bottom";
  logoPosition: "top-right" | "top-left";
  visualTheme: VisualTheme;
  colorPalette: string;
  compositionNotes: string;
  isActive: boolean;
}

export interface KaryakartaProfile {
  userId: string;
  name: string;
  designation: string;
  constituency: string;
  partyName: string;
  photoUrl?: string;
  logoUrl?: string;
  updatedAt: string;
}

export interface KaryakartaUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phoneVerified: boolean;
  googleId: string;
  role: "owner" | "member";
  ownerId?: string;
  createdAt: string;
}

export type BillingCycle = "monthly" | "yearly";
export type SubscriptionPlan = "primary" | "member";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "pending";

export interface KaryakartaSubscription {
  userId: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  subscriptionStart: string;
  subscriptionEnd: string;
  paymentProvider: "cashfree";
  providerSubscriptionId?: string;
  memberCount: number;
  updatedAt: string;
}

export interface PromptGenerateInput {
  occasionTitle: string;
  category: OccasionCategory | PostType;
  language: "mr";
  userName: string;
  designation: string;
  partyName: string;
  visualTheme: VisualTheme;
  templateId: string;
  photoPresent: boolean;
  logoPresent: boolean;
  message?: string;
  postType: PostType;
}

export const CATEGORY_LABELS: Record<OccasionCategory, string> = {
  national: "राष्ट्रीय दिन",
  maharashtra: "महाराष्ट्रातील विशेष दिवस",
  religious: "धार्मिक सण",
  cultural: "सांस्कृतिक दिवस",
  jayanti: "जयंती",
  punyatithi: "पुण्यतिथी",
  social: "सामाजिक जागृती दिन",
  person: "व्यक्तीविशेष",
  political: "राजकीय / संघटनात्मक",
  local: "स्थानिक कार्यक्रम",
  custom: "Custom Occasion",
};

export const POST_TYPE_LABELS: Record<PostType, string> = {
  "special-day": "विशेष दिवस",
  birthday: "वाढदिवस",
  jayanti: "जयंती",
  punyatithi: "पुण्यतिथी",
  congratulations: "अभिनंदन",
  event: "कार्यक्रम",
  "social-work": "सामाजिक उपक्रम",
  custom: "Custom Post",
  festival: "सण / उत्सव",
};
