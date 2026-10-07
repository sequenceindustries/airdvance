import { TIMEZONE } from "./config";

/** Today's calendar date in South Africa as YYYY-MM-DD. */
export function todaySA(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtc(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, day);
}

export function isIsoDate(d: unknown): d is string {
  if (typeof d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const [y, m, day] = d.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === day;
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
}

export function isWeekend(d: string): boolean {
  const day = new Date(toUtc(d)).getUTCDay();
  return day === 0 || day === 6;
}

export function addDays(d: string, n: number): string {
  const t = new Date(toUtc(d) + n * 86_400_000);
  return t.toISOString().slice(0, 10);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Calendar date in SA time, e.g. "Fri 6 November 2026". Deterministic on server and client. */
export function formatDate(d: string | Date, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const iso = typeof d === "string" ? d.slice(0, 10) : todaySA(d);
  const [y, m, day] = iso.split("-").map(Number);
  const wd = DAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
  return `${opts.weekday === false ? "" : `${wd} `}${day} ${MONTHS[m - 1]}${opts.year === false ? "" : ` ${y}`}`;
}

/** Server-only usage (admin and dashboard tables). */
export function formatDateTime(d: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof d === "string" ? new Date(d) : d);
}

/**
 * A sensible default payday for the calculator: the 25th (the most common SA
 * payday) of this month, or next month if the 25th is less than the minimum
 * term away.
 */
export function defaultPayday(today: string, minDays: number, maxDays: number): string {
  const [y, m] = today.split("-").map(Number);
  const candidates = [
    `${y}-${String(m).padStart(2, "0")}-25`,
    m === 12 ? `${y + 1}-01-25` : `${y}-${String(m + 1).padStart(2, "0")}-25`,
  ];
  for (let c of candidates) {
    // Most employers pay on the last weekday on or before the 25th.
    while (isWeekend(c)) c = addDays(c, -1);
    const d = daysBetween(today, c);
    if (d >= minDays && d <= maxDays) return c;
  }
  return addDays(today, Math.min(maxDays, 30));
}
