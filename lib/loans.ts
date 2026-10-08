import "server-only";
import { one, query } from "./db";
import { todaySA } from "./dates";
import { balanceOn, type Balance, type Quote } from "./pricing";
import type { Affordability, Finances } from "./affordability";

export const OPEN_APPLICATION = ["SUBMITTED", "MORE_INFO_REQUIRED"] as const;
export const OPEN_LOAN = ["OFFERED", "ACCEPTED", "ACTIVE", "ARREARS"] as const;

export interface ApplicationRow {
  id: string;
  reference: string;
  user_id: string;
  status: string;
  requested_amount: string;
  requested_due_date: string;
  quote: Quote;
  id_number_enc: string;
  id_number_last4: string;
  date_of_birth: string;
  personal: Record<string, any>;
  address: Record<string, any>;
  employment: Record<string, any>;
  finances: Finances;
  bank: { bankName: string; accountHolder: string; branchCode: string; accountType: string; last4: string };
  bank_account_enc: string;
  consents: Record<string, any>;
  affordability: Affordability;
  decision_reason: string | null;
  info_request: string | null;
  admin_notes: { at: string; by: string; note: string }[];
  submitted_at: string;
  decided_at: string | null;
  created_at: string;
}

export interface LoanRow {
  id: string;
  reference: string;
  application_id: string;
  user_id: string;
  status: string;
  principal: string;
  initiation_fee: string;
  monthly_rate: string;
  is_repeat_this_year: boolean;
  due_date: string;
  offer_quote: Quote;
  final_quote: Quote | null;
  offer_expires_at: string;
  signed_at: string | null;
  signature_name: string | null;
  mandate_reference: string | null;
  disbursed_on: string | null;
  payout_reference: string | null;
  amount_paid: string;
  settled_at: string | null;
  created_at: string;
}

/** pg returns DATE columns as JS Dates by default; normalise to YYYY-MM-DD. */
export function isoDate(v: unknown): string {
  if (v instanceof Date) return todaySA(v);
  return String(v).slice(0, 10);
}

/** Works for the current one-line address and the older multi-field shape. */
export function formatAddress(a: Record<string, any> | null | undefined): string {
  if (!a) return "";
  if (typeof a.line === "string") return a.line;
  return [a.street, a.suburb, a.city, a.province, a.postalCode].filter(Boolean).join(", ");
}

export function normaliseLoan(l: LoanRow): LoanRow {
  return { ...l, due_date: isoDate(l.due_date), disbursed_on: l.disbursed_on ? isoDate(l.disbursed_on) : null };
}

export function normaliseApplication(a: ApplicationRow): ApplicationRow {
  return { ...a, requested_due_date: isoDate(a.requested_due_date), date_of_birth: isoDate(a.date_of_birth) };
}

export async function openItemsFor(userId: string) {
  const app = await one<{ id: string; reference: string; status: string }>(
    `select id, reference, status from applications where user_id = $1 and status = any($2) order by created_at desc limit 1`,
    [userId, OPEN_APPLICATION],
  );
  const loan = await one<{ id: string; reference: string; status: string }>(
    `select id, reference, status from loans where user_id = $1 and status = any($2) order by created_at desc limit 1`,
    [userId, OPEN_LOAN],
  );
  return { app, loan };
}

/** Second and later loans paid out in the same calendar year get the lower NCA rate. */
export async function isRepeatThisYear(userId: string, onDate: string): Promise<boolean> {
  const row = await one<{ n: number }>(
    `select count(*)::int n from loans where user_id = $1 and disbursed_on is not null
       and extract(year from disbursed_on) = $2`,
    [userId, Number(onDate.slice(0, 4))],
  );
  return (row?.n ?? 0) > 0;
}

export function loanBalance(l: LoanRow, asOf = todaySA()): Balance | null {
  if (!l.disbursed_on) return null;
  return balanceOn({
    principal: Number(l.principal),
    initiationFee: Number(l.initiation_fee),
    monthlyRate: Number(l.monthly_rate),
    disbursedOn: isoDate(l.disbursed_on),
    dueDate: isoDate(l.due_date),
    paid: Number(l.amount_paid),
    asOf,
  });
}

/** Housekeeping run whenever the admin dashboard loads (and safe to run from a cron). */
export async function runSweep() {
  const today = todaySA();
  const expired = await query<{ id: string; user_id: string; reference: string }>(
    `update loans set status = 'EXPIRED', updated_at = now()
      where status = 'OFFERED' and offer_expires_at < now() returning id, user_id, reference`,
  );
  for (const l of expired) {
    await query("insert into notifications (user_id, title, body, href) values ($1,$2,$3,$4)", [
      l.user_id,
      "Your offer has expired",
      `Offer ${l.reference} wasn't signed in time, so it has lapsed. You're welcome to apply again.`,
      "/dashboard",
    ]);
  }
  const arrears = await query<{ id: string; user_id: string; reference: string }>(
    `update loans set status = 'ARREARS', updated_at = now()
      where status = 'ACTIVE' and due_date < $1 returning id, user_id, reference`,
    [today],
  );
  for (const l of arrears) {
    await query("insert into notifications (user_id, title, body, href) values ($1,$2,$3,$4)", [
      l.user_id,
      "Your repayment is overdue",
      `We haven't received the full repayment for loan ${l.reference}. Please contact us or settle from your dashboard as soon as you can.`,
      `/dashboard/loans/${l.id}`,
    ]);
  }
  return { expired: expired.length, arrears: arrears.length };
}
