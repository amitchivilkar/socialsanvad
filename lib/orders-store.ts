import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export const MAX_DOWNLOADS = 5;
export const DOWNLOAD_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

export type OrderRecord = {
  orderId: string;
  ebookSlug: string;
  name: string;
  phone: string;
  status: "pending" | "paid" | "failed";
  downloadToken?: string;
  downloadCount: number;
  downloadExpiresAt?: string;
  whatsappSentAt?: string;
  createdAt: string;
  paidAt?: string;
};

type StoreShape = {
  orders: Record<string, OrderRecord>;
  tokens: Record<string, string>; // token -> orderId
};

const LOCAL_FILE = path.join(process.cwd(), ".data", "orders.json");

function hasUpstash() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function upstash<T>(
  command: (string | number)[]
): Promise<T | null> {
  const results = await upstashPipeline([command]);
  return (results[0] as T | null) ?? null;
}

/** Batch multiple Redis commands in one HTTP round-trip. */
async function upstashPipeline(
  commands: (string | number)[][]
): Promise<unknown[]> {
  if (!commands.length) return [];

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return [];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash error: ${text}`);
  }

  const data: unknown = await res.json();
  if (Array.isArray(data)) {
    return data.map((item) =>
      item && typeof item === "object" && "result" in item
        ? (item as { result: unknown }).result
        : null
    );
  }
  if (data && typeof data === "object" && "result" in data) {
    return [(data as { result: unknown }).result];
  }
  return [];
}

const UPSTASH_GET_BATCH = 100;

async function fetchOrdersByIds(ids: string[]): Promise<OrderRecord[]> {
  if (!ids.length) return [];

  const orders: OrderRecord[] = [];

  for (let i = 0; i < ids.length; i += UPSTASH_GET_BATCH) {
    const batch = ids.slice(i, i + UPSTASH_GET_BATCH);
    try {
      const results = await upstashPipeline(
        batch.map((id) => ["GET", orderKey(id)])
      );
      for (const raw of results) {
        if (typeof raw !== "string" || !raw) continue;
        try {
          orders.push(JSON.parse(raw) as OrderRecord);
        } catch {
          /* skip corrupt entry */
        }
      }
    } catch {
      // Fallback: parallel individual fetches for this batch
      const fallback = await Promise.all(batch.map((id) => getOrder(id)));
      for (const order of fallback) {
        if (order) orders.push(order);
      }
    }
  }

  return orders;
}

function sortOrdersNewestFirst(orders: OrderRecord[]): OrderRecord[] {
  return orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function readLocal(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(LOCAL_FILE, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    return { orders: {}, tokens: {} };
  }
}

async function writeLocal(store: StoreShape) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(store, null, 2), "utf8");
}

function orderKey(orderId: string) {
  return `ss:order:${orderId}`;
}

function tokenKey(token: string) {
  return `ss:token:${token}`;
}

function ordersIndexKey() {
  return "ss:orders:index";
}

async function indexOrder(orderId: string) {
  if (hasUpstash()) {
    await upstash(["SADD", ordersIndexKey(), orderId]);
  }
}

export async function savePendingOrder(input: {
  orderId: string;
  ebookSlug: string;
  name: string;
  phone: string;
}): Promise<OrderRecord> {
  const record: OrderRecord = {
    orderId: input.orderId,
    ebookSlug: input.ebookSlug,
    name: input.name,
    phone: input.phone.replace(/\D/g, "").slice(-10),
    status: "pending",
    downloadCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (hasUpstash()) {
    await upstash(["SET", orderKey(record.orderId), JSON.stringify(record)]);
    await indexOrder(record.orderId);
    return record;
  }

  const store = await readLocal();
  store.orders[record.orderId] = record;
  await writeLocal(store);
  return record;
}

export async function getOrder(orderId: string): Promise<OrderRecord | null> {
  if (hasUpstash()) {
    const raw = await upstash<string | null>(["GET", orderKey(orderId)]);
    if (!raw) return null;
    return JSON.parse(raw) as OrderRecord;
  }

  const store = await readLocal();
  return store.orders[orderId] ?? null;
}

export async function getOrderByToken(
  token: string
): Promise<OrderRecord | null> {
  if (hasUpstash()) {
    const orderId = await upstash<string | null>(["GET", tokenKey(token)]);
    if (!orderId) return null;
    return getOrder(orderId);
  }

  const store = await readLocal();
  const orderId = store.tokens[token];
  if (!orderId) return null;
  return store.orders[orderId] ?? null;
}

async function writeOrder(record: OrderRecord, previousToken?: string) {
  if (hasUpstash()) {
    if (previousToken && previousToken !== record.downloadToken) {
      await upstash(["DEL", tokenKey(previousToken)]);
    }
    await upstash(["SET", orderKey(record.orderId), JSON.stringify(record)]);
    await indexOrder(record.orderId);
    if (record.downloadToken) {
      await upstash(["SET", tokenKey(record.downloadToken), record.orderId]);
    }
    return;
  }

  const store = await readLocal();
  if (previousToken && previousToken !== record.downloadToken) {
    delete store.tokens[previousToken];
  }
  store.orders[record.orderId] = record;
  if (record.downloadToken) {
    store.tokens[record.downloadToken] = record.orderId;
  }
  await writeLocal(store);
}

export async function listOrders(): Promise<OrderRecord[]> {
  if (hasUpstash()) {
    const ids =
      (await upstash<string[] | null>(["SMEMBERS", ordersIndexKey()])) || [];
    const orders = await fetchOrdersByIds(ids);
    return sortOrdersNewestFirst(orders);
  }

  const store = await readLocal();
  return sortOrdersNewestFirst(Object.values(store.orders));
}

export function createDownloadToken(): string {
  return randomBytes(24).toString("hex");
}

export async function markOrderPaidAndIssueToken(
  orderId: string
): Promise<OrderRecord | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;

  if (existing.status === "paid" && existing.downloadToken) {
    return existing;
  }

  const token = existing.downloadToken || createDownloadToken();
  const updated: OrderRecord = {
    ...existing,
    status: "paid",
    paidAt: existing.paidAt || new Date().toISOString(),
    downloadToken: token,
    downloadExpiresAt:
      existing.downloadExpiresAt ||
      new Date(Date.now() + DOWNLOAD_TTL_MS).toISOString(),
  };

  await writeOrder(updated);
  return updated;
}

/**
 * Issue a fresh download link: new token, +72h expiry, download count reset to 0.
 * Old token stops working.
 */
export async function renewDownloadLink(
  orderId: string
): Promise<{ order: OrderRecord; downloadUrl: string } | null> {
  const existing = await getOrder(orderId);
  if (!existing) return null;
  if (existing.status !== "paid") return null;

  const previousToken = existing.downloadToken;
  const token = createDownloadToken();
  const updated: OrderRecord = {
    ...existing,
    downloadToken: token,
    downloadCount: 0,
    downloadExpiresAt: new Date(Date.now() + DOWNLOAD_TTL_MS).toISOString(),
  };

  await writeOrder(updated, previousToken);
  return { order: updated, downloadUrl: getDownloadUrl(token) };
}

export async function markWhatsappSent(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order) return;
  order.whatsappSentAt = new Date().toISOString();
  await writeOrder(order);
}

export type DownloadGateResult =
  | { ok: true; order: OrderRecord }
  | { ok: false; code: "not_found" | "unpaid" | "expired" | "limit"; message: string };

export async function assertCanDownload(
  token: string
): Promise<DownloadGateResult> {
  const order = await getOrderByToken(token);
  if (!order) {
    return {
      ok: false,
      code: "not_found",
      message: "ही लिंक अवैध आहे किंवा कालबाह्य झाली आहे.",
    };
  }

  if (order.status !== "paid") {
    return {
      ok: false,
      code: "unpaid",
      message: "पेमेंट पूर्ण झाल्याशिवाय डाउनलोड उपलब्ध नाही.",
    };
  }

  if (
    order.downloadExpiresAt &&
    new Date(order.downloadExpiresAt).getTime() < Date.now()
  ) {
    return {
      ok: false,
      code: "expired",
      message: "ही डाउनलोड लिंक कालबाह्य झाली आहे. संपर्क साधा.",
    };
  }

  if (order.downloadCount >= MAX_DOWNLOADS) {
    return {
      ok: false,
      code: "limit",
      message: `डाउनलोड मर्यादा संपली (${MAX_DOWNLOADS} वेळा). मदतीसाठी संपर्क साधा.`,
    };
  }

  return { ok: true, order };
}

export async function incrementDownloadCount(
  orderId: string
): Promise<OrderRecord | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  order.downloadCount += 1;
  await writeOrder(order);
  return order;
}

export function getDownloadUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://socialsanvad.com").replace(
    /\/$/,
    ""
  );
  return `${base}/download/${token}`;
}

export function isOrderStoreConfigured(): boolean {
  return hasUpstash() || process.env.NODE_ENV !== "production";
}
