import fs from "fs";
import path from "path";
import {
  addDays,
  format,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import type { CalendarOccasion } from "./types";

const calendarPath = path.join(
  process.cwd(),
  "data/karyakarta/calendar.json"
);

let cache: CalendarOccasion[] | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

function loadOccasionsSync(): CalendarOccasion[] {
  const raw = fs.readFileSync(calendarPath, "utf8");
  return JSON.parse(raw) as CalendarOccasion[];
}

/** Clear cache after admin writes (same process). */
export function invalidateCalendarCache() {
  cache = null;
  cacheAt = 0;
}

export function getAllOccasions(): CalendarOccasion[] {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_MS) {
    return cache.filter((o) => o.isActive);
  }
  cache = loadOccasionsSync();
  cacheAt = now;
  return cache.filter((o) => o.isActive);
}

function occasionMatchesDate(
  occasion: CalendarOccasion,
  day: Date
): boolean {
  const ymd = format(day, "yyyy-MM-dd");
  const md = format(day, "MM-dd");

  if (occasion.dateType === "fixed" || occasion.date.length === 5) {
    return occasion.date === md || occasion.date.endsWith(`-${md}`);
  }

  return occasion.date === ymd;
}

export function getOccasionsForDate(day: Date = new Date()): CalendarOccasion[] {
  const target = startOfDay(day);
  return getAllOccasions().filter((o) => occasionMatchesDate(o, target));
}

export function getTodayOccasions(now: Date = new Date()): CalendarOccasion[] {
  return getOccasionsForDate(now);
}

export function getUpcomingOccasions(
  days: number,
  now: Date = new Date()
): Array<CalendarOccasion & { occursOn: string }> {
  const results: Array<CalendarOccasion & { occursOn: string }> = [];
  const seen = new Set<string>();

  for (let i = 1; i <= days; i++) {
    const day = addDays(startOfDay(now), i);
    const list = getOccasionsForDate(day);
    for (const occ of list) {
      const key = `${occ.id}:${format(day, "yyyy-MM-dd")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ ...occ, occursOn: format(day, "yyyy-MM-dd") });
    }
  }

  return results;
}

export function getOccasionBySlug(slug: string): CalendarOccasion | undefined {
  return getAllOccasions().find((o) => o.slug === slug);
}

export function getOccasionById(id: string): CalendarOccasion | undefined {
  return getAllOccasions().find((o) => o.id === id);
}

export function formatMarathiShortDate(isoDate: string): string {
  const d = parseISO(isoDate);
  const months = [
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
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function isToday(isoDate: string, now = new Date()): boolean {
  return isSameDay(parseISO(isoDate), now);
}
