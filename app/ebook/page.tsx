import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AI_DIARY_LANDING_SLUG } from "@/lib/ebooks";

export const metadata: Metadata = {
  title: "ई-बुक | Social Sanvad",
  description:
    "कार्यकर्त्याची AI डायरी — 1.0, 2.0 आणि Bundle एकाच पेजवर.",
  alternates: { canonical: `/ebook/${AI_DIARY_LANDING_SLUG}` },
};

/** Shop index → single AI Diary landing (version switch on page). */
export default function EbookShopPage() {
  redirect(`/ebook/${AI_DIARY_LANDING_SLUG}`);
}
