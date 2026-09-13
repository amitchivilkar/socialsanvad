import { NextResponse } from "next/server";
import {
  assertCanDownload,
  MAX_DOWNLOADS,
  tryConsumeDownload,
} from "@/lib/orders-store";
import { loadEbookPdf } from "@/lib/fulfill-order";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;

  const gate = await assertCanDownload(token);
  if (!gate.ok) {
    // Prefer the HTML download page over raw JSON in browsers / WhatsApp
    return NextResponse.redirect(
      new URL(`/download/${token}`, _request.url),
      303
    );
  }

  try {
    // Load PDF first so a storage failure does not burn a download slot
    const pdf = await loadEbookPdf();

    const consumed = await tryConsumeDownload(gate.order.orderId);
    if (!consumed.ok) {
      return NextResponse.redirect(
        new URL(`/download/${token}`, _request.url),
        303
      );
    }

    const remaining = MAX_DOWNLOADS - consumed.order.downloadCount;

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
