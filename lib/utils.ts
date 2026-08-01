import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toMarathiDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => marathiDigits[Number(d)]);
}

const marathiMonths = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

export function formatMarathiDate(dateString: string): string {
  const date = new Date(dateString);
  const day = toMarathiDigits(date.getDate());
  const month = marathiMonths[date.getMonth()];
  const year = toMarathiDigits(date.getFullYear());
  return `${day} ${month} ${year}`;
}

export function readingTimeLabel(minutes: number): string {
  return `${toMarathiDigits(minutes)} मिनिटं वाचा`;
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://socialsanvad.com";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0900-\u097F\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
