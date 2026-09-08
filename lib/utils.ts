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

export function readingTimeLabel(minutes: number | string): string {
  if (typeof minutes === "string") {
    const range = minutes.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      return `${toMarathiDigits(Number(range[1]))}–${toMarathiDigits(Number(range[2]))} मिनिटं वाचा`;
    }
    const n = Number.parseInt(minutes, 10);
    if (!Number.isNaN(n) && n > 0) {
      return `${toMarathiDigits(n)} मिनिटं वाचा`;
    }
  }
  const n = typeof minutes === "number" ? minutes : 1;
  return `${toMarathiDigits(Math.max(1, n))} मिनिटं वाचा`;
}

/** Numeric minutes for sorting/metadata; range "12-15" → 15. */
export function resolveReadingMinutes(
  value: number | string | undefined,
  fallback: number
): number {
  if (typeof value === "number" && value > 0) return Math.ceil(value);
  if (typeof value === "string") {
    const range = value.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) return Math.max(1, Number(range[2]));
    const n = Number.parseInt(value, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return Math.max(1, fallback);
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
