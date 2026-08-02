import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listOrders, MAX_DOWNLOADS } from "@/lib/orders-store";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await listOrders();

  return NextResponse.json({
    maxDownloads: MAX_DOWNLOADS,
    count: orders.length,
    paid: orders.filter((o) => o.status === "paid").length,
    orders,
  });
}
