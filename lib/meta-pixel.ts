export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "3625309240965799";

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
    _fbq?: unknown;
  }
}

function fireFbq(event: string, params?: Record<string, unknown>) {
  if (typeof window.fbq !== "function") return false;
  if (params) {
    window.fbq("track", event, params);
  } else {
    window.fbq("track", event);
  }
  return true;
}

/** Wait until Meta pixel snippet defines window.fbq (max ~10s). */
export function whenFbqReady(timeoutMs = 10000): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (typeof window.fbq === "function") return Promise.resolve(true);

  return new Promise((resolve) => {
    const started = Date.now();
    const id = window.setInterval(() => {
      if (typeof window.fbq === "function") {
        window.clearInterval(id);
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        window.clearInterval(id);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Track a Meta standard event once fbq is ready.
 * Fixes race where success page mounts before the pixel script.
 */
export function trackMetaEvent(
  event: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  if (fireFbq(event, params)) return;

  void whenFbqReady().then((ready) => {
    if (ready) fireFbq(event, params);
  });
}
