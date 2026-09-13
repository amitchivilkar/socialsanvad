import { promises as fs } from "fs";
import path from "path";

export type DownloadLogEntry = {
  id: string;
  orderId: string;
  at: string;
  ip: string;
  userAgent: string;
  /** Short label: Mobile / Desktop / WhatsApp / Unknown */
  device: string;
};

const MAX_LOGS_PER_ORDER = 40;
const LOCAL_FILE = path.join(process.cwd(), ".data", "download-logs.json");

type LocalShape = Record<string, DownloadLogEntry[]>;

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function logsKey(orderId: string) {
  return `ss:order:${orderId}:dl-logs`;
}

async function upstash<T>(
  command: (string | number)[]
): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash error: ${text}`);
  }

  const data = (await res.json()) as { result: T };
  return data.result;
}

async function readLocal(): Promise<LocalShape> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as LocalShape;
  } catch {
    return {};
  }
}

async function writeLocal(store: LocalShape) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function deviceFromUserAgent(ua: string): string {
  const s = ua.toLowerCase();
  if (!s) return "Unknown";
  if (s.includes("whatsapp")) return "WhatsApp";
  if (s.includes("iphone") || s.includes("ipad") || s.includes("android")) {
    return "Mobile";
  }
  if (s.includes("macintosh") || s.includes("windows") || s.includes("linux")) {
    return "Desktop";
  }
  return "Other";
}

export async function appendDownloadLog(input: {
  orderId: string;
  ip: string;
  userAgent: string;
}): Promise<DownloadLogEntry> {
  const entry: DownloadLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderId: input.orderId,
    at: new Date().toISOString(),
    ip: input.ip.slice(0, 64),
    userAgent: input.userAgent.slice(0, 300),
    device: deviceFromUserAgent(input.userAgent),
  };

  if (hasUpstash()) {
    const key = logsKey(input.orderId);
    await upstash(["LPUSH", key, JSON.stringify(entry)]);
    await upstash(["LTRIM", key, 0, MAX_LOGS_PER_ORDER - 1]);
    return entry;
  }

  const store = await readLocal();
  const list = store[input.orderId] || [];
  store[input.orderId] = [entry, ...list].slice(0, MAX_LOGS_PER_ORDER);
  await writeLocal(store);
  return entry;
}

export async function listDownloadLogs(
  orderId: string
): Promise<DownloadLogEntry[]> {
  if (hasUpstash()) {
    const raw =
      (await upstash<(string | null)[] | null>([
        "LRANGE",
        logsKey(orderId),
        0,
        MAX_LOGS_PER_ORDER - 1,
      ])) || [];
    const logs: DownloadLogEntry[] = [];
    for (const item of raw) {
      if (typeof item !== "string") continue;
      try {
        logs.push(JSON.parse(item) as DownloadLogEntry);
      } catch {
        /* skip */
      }
    }
    return logs;
  }

  const store = await readLocal();
  return store[orderId] || [];
}

/** Unique IPs in log — helpful share signal when > 1. */
export function uniqueIps(logs: DownloadLogEntry[]): string[] {
  return [...new Set(logs.map((l) => l.ip).filter((ip) => ip && ip !== "unknown"))];
}
