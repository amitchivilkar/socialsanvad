import { NextResponse } from "next/server";
import {
  assertCanDownload,
  MAX_DOWNLOADS,
  tryConsumeDownload,
} from "@/lib/orders-store";
import { loadEbookPdf } from "@/lib/fulfill-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ token: string }> };

function isLikelyBot(request: Request): boolean {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  if (!ua) return false;
  // Only known *preview crawlers* — do NOT match generic "whatsapp" (in-app browser).
  return (
    ua.includes("facebookexternalhit") ||
    ua.includes("facebot") ||
    ua.includes("twitterbot") ||
    ua.includes("slackbot") ||
    ua.includes("telegrambot") ||
    ua.includes("discordbot") ||
    ua.includes("linkedinbot") ||
    ua.includes("whatsapp/") || // WhatsApp link-preview crawler, not WebView
    ua.includes("googlebot") ||
    ua.includes("bingbot")
  );
}

function redirectToPage(request: Request, token: string, error: string) {
  const url = new URL(`/download/${token}`, request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, {
    status: 303,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function GET(request: Request, { params }: Params) {
  const { token } = await params;

  // Link previews must not burn download slots
  if (isLikelyBot(request)) {
    return NextResponse.redirect(new URL(`/download/${token}`, request.url), {
      status: 303,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  const gate = await assertCanDownload(token);
  if (!gate.ok) {
    return redirectToPage(request, token, gate.code);
  }

  try {
    // Load PDF first so a storage failure does not burn a download slot
    const pdf = await loadEbookPdf();

    const consumed = await tryConsumeDownload(gate.order.orderId);
    if (!consumed.ok) {
      return redirectToPage(request, token, consumed.code);
    }

    const remaining = MAX_DOWNLOADS - consumed.order.downloadCount;

    return new NextResponse(new Uint8Array(pdf.buffer), {
      status: 200,
      headers: {
        "Content-Type": pdf.contentType,
        "Content-Disposition": `attachment; filename="${pdf.filename}"`,
        "Cache-Control": "no-store, max-age=0",
        "X-Download-Remaining": String(Math.max(0, remaining)),
      },
    });
  } catch (err) {
    console.error("[download]", err);
    return redirectToPage(request, token, "failed");
  }
}
