import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renewDownloadLink } from "@/lib/orders-store";

export const runtime = "nodejs";

const bodySchema = z.object({
  orderId: z.string().min(3),
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
  }

  const result = await renewDownloadLink(parsed.data.orderId);
  if (!result) {
    return NextResponse.json(
      { error: "Order not found or not paid" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    order: result.order,
    downloadUrl: result.downloadUrl,
    expiresAt: result.order.downloadExpiresAt,
  });
}
