import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { invalidateCalendarCache } from "@/lib/karyakarta/calendar";
import {
  listCalendarForAdmin,
  saveCalendarOverride,
} from "@/lib/karyakarta/calendar-store";
import type { CalendarOccasion } from "@/lib/karyakarta/types";

export const runtime = "nodejs";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const occasions = await listCalendarForAdmin();
  return NextResponse.json({ occasions });
}

const createSchema = z.object({
  title: z.string().min(2),
  date: z.string().min(5),
  category: z.string(),
  defaultGreeting: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const id = `occ-manual-${Date.now()}`;
  const occasion: CalendarOccasion = {
    id,
    title: parsed.data.title,
    slug: slugify(parsed.data.title) || id,
    date: parsed.data.date,
    dateType: parsed.data.date.length === 5 ? "fixed" : "manual",
    category: parsed.data.category as CalendarOccasion["category"],
    description: parsed.data.description,
    defaultGreeting: parsed.data.defaultGreeting || parsed.data.title,
    visualTheme: "formal",
    recommendedStyle: "political social media poster",
    templateIds: ["tpl-custom-modern"],
    isActive: true,
  };
  await saveCalendarOverride(occasion);
  invalidateCalendarCache();
  return NextResponse.json({ ok: true, occasion });
}

const patchSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  defaultGreeting: z.string().optional(),
});

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const all = await listCalendarForAdmin();
  const existing = all.find((o) => o.id === parsed.data.id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const next = { ...existing, ...parsed.data };
  await saveCalendarOverride(next);
  invalidateCalendarCache();
  return NextResponse.json({ ok: true, occasion: next });
}
