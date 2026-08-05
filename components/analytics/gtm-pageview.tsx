"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackGtmPageView } from "@/lib/gtm";

/**
 * Pushes virtual_page_view on client-side route changes.
 * In GTM: trigger = Custom Event "virtual_page_view" → GA4 page_view (or GA4 Config).
 * Initial load is covered by GTM All Pages + GA4 Configuration tag.
 */
export function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const qs = searchParams?.toString();
    trackGtmPageView(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
