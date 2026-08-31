import fs from "fs";
import path from "path";
import type { CalendarOccasion } from "./types";

type RedisConfig = { url: string; token: string };

function redisConfig(): RedisConfig | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function redisFetch<T>(command: (string | number)[]): Promise<T | null> {
  const cfg = redisConfig();
  if (!cfg) return null;
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result: T };
  return data.result;
}

const OVERRIDES_KEY = "ss:kat:calendar:overrides";
const calendarPath = path.join(
  process.cwd(),
  "data/karyakarta/calendar.json"
);

function readBase(): CalendarOccasion[] {
  return JSON.parse(
    fs.readFileSync(calendarPath, "utf8")
  ) as CalendarOccasion[];
}

export async function readCalendarMerged(): Promise<CalendarOccasion[]> {
  const base = readBase();
  const raw = redisConfig()
    ? await redisFetch<string | null>(["GET", OVERRIDES_KEY])
    : null;
  if (!raw) return base;
  try {
    const overrides = JSON.parse(raw) as CalendarOccasion[];
    const map = new Map(base.map((o) => [o.id, o]));
    for (const o of overrides) map.set(o.id, o);
    return [...map.values()];
  } catch {
    return base;
  }
}

export async function saveCalendarOverride(occasion: CalendarOccasion) {
  const current = await readCalendarMerged();
  const map = new Map(current.map((o) => [o.id, o]));
  map.set(occasion.id, occasion);
  const all = [...map.values()];

  if (redisConfig()) {
    await redisFetch(["SET", OVERRIDES_KEY, JSON.stringify(all)]);
    return all;
  }

  // Local: write full file for persistence in dev
  fs.writeFileSync(calendarPath, JSON.stringify(all, null, 2));
  return all;
}

export async function listCalendarForAdmin(): Promise<CalendarOccasion[]> {
  return readCalendarMerged();
}
