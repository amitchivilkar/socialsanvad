import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getDownloadUrl,
  listOrders,
  MAX_DOWNLOADS,
  updateOrderDetails,
} from "@/lib/orders-store";

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
    orders: orders.map((o) => ({
      ...o,
      downloadUrl: o.downloadToken ? getDownloadUrl(o.downloadToken) : null,
    })),
  });
}

const updateSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(10).max(15).optional(),
});

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid name or phone" },
      { status: 400 }
    );
  }

  const { orderId, name, phone } = parsed.data;
  if (name === undefined && phone === undefined) {
    return NextResponse.json(
      { error: "Provide name and/or phone" },
      { status: 400 }
    );
  }

  const updated = await updateOrderDetails(orderId, { name, phone });
  if (!updated) {
    return NextResponse.json(
      { error: "Order not found or invalid details" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    order: {
      ...updated,
      downloadUrl: updated.downloadToken
        ? getDownloadUrl(updated.downloadToken)
        : null,
    },
  });
}
