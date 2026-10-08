"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONSENT_COOKIE, FLASH_COOKIE, GA_ID, loadGa, sanitizePath, track, type FunnelEvent } from "@/lib/analytics";

type Consent = "granted" | "denied" | null;

function readCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function writeCookie(name: string, value: string, maxAgeDays: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${Math.round(maxAgeDays * 86400)}; SameSite=Lax${secure}`;
}
function clearGaCookies() {
  const host = location.hostname;
  for (const c of document.cookie.split("; ")) {
    const name = c.split("=")[0];
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      for (const domain of ["", `; Domain=${host}`, `; Domain=.${host}`]) {
        document.cookie = `${name}=; Path=/; Max-Age=0${domain}`;
      }
    }
  }
}

/**
 * Consent-first Google Analytics 4. Nothing is loaded and no Google cookie is
 * set until the visitor accepts. Admin pages are never tracked.
 */
export function Analytics() {
  const pathname = usePathname() || "/";
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isAdmin = pathname.startsWith("/admin");
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const c = readCookie(CONSENT_COOKIE) as Consent;
    setConsent(c === "granted" || c === "denied" ? c : null);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener("airdvance:cookie-settings", reopen);
    return () => window.removeEventListener("airdvance:cookie-settings", reopen);
  }, []);

  // Page views + queued server-side events.
  useEffect(() => {
    if (consent !== "granted" || isAdmin) return;
    loadGa();
    const path = sanitizePath(pathname);
    if (lastSent.current !== path) {
      lastSent.current = path;
      // Every later event (including GA's automatic ones) reports this clean location.
      window.gtag?.("set", { page_location: `${location.origin}${path}`, page_path: path });
      window.gtag?.("event", "page_view", {
        page_path: path,
        page_location: `${location.origin}${path}`,
        page_title: document.title.replace(/\s*·\s*Airdvance$/, "") || "Airdvance",
        page_referrer: document.referrer ? new URL(document.referrer).origin : undefined,
      });
    }
    const flashed = readCookie(FLASH_COOKIE);
    if (flashed) {
      document.cookie = `${FLASH_COOKIE}=; Path=/; Max-Age=0`;
      for (const e of flashed.split(",")) if (e) track(e as FunnelEvent, e === "sign_up" || e === "login" ? { method: "email" } : {});
    }
  }, [consent, pathname, isAdmin]);

  // Clicks on elements marked data-track="event" (+ optional data-track-location).
  useEffect(() => {
    if (consent !== "granted" || isAdmin) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (el) track(el.dataset.track as FunnelEvent, { location: el.dataset.trackLocation });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [consent, isAdmin]);

  const choose = useCallback((c: "granted" | "denied") => {
    writeCookie(CONSENT_COOKIE, c, 180);
    if (c === "denied") {
      (window as any)[`ga-disable-${GA_ID}`] = true;
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      clearGaCookies();
    }
    setConsent(c);
    setOpen(false);
  }, []);

  if (!ready || isAdmin || !(consent === null || open)) return null;
  return (
    <div role="region" aria-label="Cookie choice" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-ink/15 bg-night-800/95 p-4 shadow-card backdrop-blur sm:p-5">
      <p className="text-sm text-ink">
        Can we use analytics cookies to see which pages help people? We never send your personal or application details.{" "}
        <Link href="/privacy" className="underline underline-offset-2">Privacy policy</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose("granted")} className="btn bg-ink px-5 py-2 text-sm text-night hover:bg-white">
          Accept
        </button>
        <button type="button" onClick={() => choose("denied")} className="btn-ghost px-5 py-2 text-sm">
          Decline
        </button>
      </div>
    </div>
  );
}

/** Footer button to reopen the cookie choice. */
export function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("airdvance:cookie-settings"))} className="hover:text-ink">
      Cookie settings
    </button>
  );
}
