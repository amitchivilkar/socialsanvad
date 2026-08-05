export const GTM_ID =
  process.env.NEXT_PUBLIC_GTM_ID || "GTM-P7JMWJPT";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

/** Virtual page view for App Router client navigations (pair with GTM Custom Event). */
export function trackGtmPageView(url: string) {
  pushDataLayer({
    event: "virtual_page_view",
    page_path: url,
  });
}
