/**
 * Analytics helpers shared by client code. Nothing here may carry personal
 * data: event names and a small set of non-identifying parameters only
 * (step names, button locations). Never pass names, contact details, ID or
 * account numbers, amounts, income or any application answer.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-FQ3T7FMQE2";
export const CONSENT_COOKIE = "ad_consent";
export const FLASH_COOKIE = "ad_evt";

/** Funnel events. Recommended GA4 names where one exists. */
export type FunnelEvent =
  | "apply_click" // any "Apply" CTA; param: location
  | "sign_up" // account created; param: method
  | "login" // param: method
  | "begin_application" // application wizard opened
  | "application_step" // param: step (Amount, You, Income, Bank, Documents, Confirm)
  | "generate_lead" // application submitted
  | "sign_agreement" // credit agreement signed
  | "contact_submitted";

type Params = { location?: string; method?: string; step?: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function hasConsent() {
  return typeof document !== "undefined" && new RegExp(`(?:^|; )${CONSENT_COOKIE}=granted(?:;|$)`).test(document.cookie);
}

let loaded = false;
/** Load gtag.js. Only ever called after the visitor has accepted analytics cookies. */
export function loadGa() {
  if (loaded || !GA_ID || GA_ID === "off" || !hasConsent()) return;
  loaded = true;
  (window as any)[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  // gtag must push the real `arguments` object.
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, {
    send_page_view: false, // page views are sent manually with a sanitised path
    page_location: `${location.origin}${sanitizePath(location.pathname)}`,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Fires only if analytics consent was given; otherwise a no-op. */
export function track(event: FunnelEvent, params: Params = {}) {
  if (typeof window === "undefined" || !hasConsent()) return;
  loadGa();
  if (!window.gtag) return;
  const safe: Record<string, string> = {};
  for (const k of ["location", "method", "step"] as const) {
    const v = params[k];
    if (v && /^[A-Za-z0-9 _-]{1,40}$/.test(v)) safe[k] = v;
  }
  // Override the default page_location (which would include query strings and record IDs).
  window.gtag("event", event, { ...safe, page_location: `${location.origin}${sanitizePath(location.pathname)}` });
}

/**
 * Page path with anything that could identify a person or record removed:
 * query strings and fragments are dropped, and UUID/numeric/reference
 * segments become ":id".
 */
export function sanitizePath(pathname: string) {
  return (
    pathname
      .split("/")
      .map((seg) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) || /\d{3,}/.test(seg) ? ":id" : seg,
      )
      .join("/") || "/"
  );
}
