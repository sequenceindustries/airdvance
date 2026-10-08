import "server-only";
import { cookies } from "next/headers";
import { FLASH_COOKIE, type FunnelEvent } from "./analytics";

/**
 * Queue a funnel event that happened on the server (e.g. inside a server
 * action that then redirects). The client Analytics component reads the
 * short-lived cookie on the next page, sends the event if consent was given,
 * and clears it. The cookie holds only the event name.
 */
export function flashEvent(event: FunnelEvent) {
  const existing = cookies().get(FLASH_COOKIE)?.value;
  const list = existing ? `${existing},${event}` : event;
  cookies().set(FLASH_COOKIE, list.slice(0, 200), { path: "/", maxAge: 120, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
}
