import { NextResponse } from "next/server";
import {
  assertCanDownload,
  incrementDownloadCount,
  MAX_DOWNLOADS,
} from "@/lib/orders-store";
import { loadEbookPdf } from "@/lib/fulfill-order";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;

  const gate = await assertCanDownload(token);
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.message, code: gate.code },
      { status: gate.code === "not_found" ? 404 : 403 }
    );
  }

  try {
    const updated = await incrementDownloadCount(gate.order.orderId);
    const pdf = await loadEbookPdf();

    const remaining = MAX_DOWNLOADS - (updated?.downloadCount ?? gate.order.downloadCount + 1);

    return new NextResponse(new Uint8Array(pdf.buffer), {
      status: 200,
      headers: {
        "Content-Type": pdf.contentType,
        "Content-Disposition": `attachment; filename="${pdf.filename}"`,
        "Cache-Control": "no-store",
        "X-Download-Remaining": String(Math.max(0, remaining)),
      },
    });
  } catch (err) {
    console.error("[download]", err);
    return NextResponse.json(
      {
        error:
          "PDF आता उपलब्ध नाही. कृपया contact@ / WhatsApp वर लिहा.",
      },
      { status: 500 }
    );
  }
}
