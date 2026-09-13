import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getOrder } from "@/lib/orders-store";
import { listDownloadLogs, uniqueIps } from "@/lib/download-logs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const logs = await listDownloadLogs(orderId);
  const ips = uniqueIps(logs);

  return NextResponse.json({
    orderId,
    name: order.name,
    phone: order.phone,
    downloadCount: order.downloadCount,
    logs,
    uniqueIpCount: ips.length,
    uniqueIps: ips,
    shareLikely: ips.length > 1,
  });
}
