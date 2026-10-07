"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clientIp, requireAdmin } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { one, query, tx } from "@/lib/db";
import { addDays, daysBetween, formatDate, todaySA } from "@/lib/dates";
import { isRepeatThisYear, loanBalance, normaliseApplication, normaliseLoan, type ApplicationRow, type LoanRow } from "@/lib/loans";
import { messaging } from "@/lib/messaging";
import { payments } from "@/lib/payments";
import { calculateQuote, formatRand, isQuoteError, round2 } from "@/lib/pricing";
import { audit, makeReference, notify } from "@/lib/records";
import { PRODUCT } from "@/lib/config";
import type { FormState } from "./auth";

async function sms(userId: string, body: string) {
  const u = await one<{ mobile: string }>("select mobile from users where id = $1", [userId]);
  if (u) await messaging().send(u.mobile, body).catch(() => undefined);
}

async function loadApp(id: string) {
  const a = await one<ApplicationRow>("select * from applications where id = $1", [id]);
  return a ? normaliseApplication(a) : null;
}

const ApproveSchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.coerce.number().int(),
  dueDate: z.string(),
  note: z.string().max(2000).optional(),
});

export async function approveApplication(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = ApproveSchema.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const app = await loadApp(p.data.applicationId);
  if (!app || app.status !== "SUBMITTED") return { error: "Only submitted applications can be approved." };
  if (p.data.amount > Number(app.requested_amount)) return { error: "You can't approve more than the customer asked for." };
  if (form.get("verified") !== "on") return { error: "Confirm you've verified identity, income, bank statements and the credit check." };

  const today = todaySA();
  const repeat = await isRepeatThisYear(app.user_id, today);
  const quote = calculateQuote({ principal: p.data.amount, startDate: today, dueDate: p.data.dueDate, isRepeatThisYear: repeat });
  if (isQuoteError(quote)) return { error: quote.error };

  const reference = makeReference("AL");
  const ip = clientIp();
  try {
    await tx(async (c) => {
      const upd = await c.query(
        `update applications set status = 'APPROVED', decided_at = now(), decided_by = $2, updated_at = now(),
           admin_notes = admin_notes || $3::jsonb where id = $1 and status = 'SUBMITTED' returning id`,
        [app.id, admin.id, JSON.stringify(p.data.note?.trim() ? [{ at: new Date().toISOString(), by: admin.full_name, note: `Approved: ${p.data.note.trim()}` }] : [])],
      );
      if (!upd.rowCount) throw new Error("state");
      const loan = await c.query(
        `insert into loans (reference, application_id, user_id, principal, initiation_fee, monthly_rate, is_repeat_this_year,
            due_date, offer_quote, offer_expires_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9, now() + ($10 || ' days')::interval) returning id`,
        [reference, app.id, app.user_id, quote.principal, quote.initiationFee, quote.monthlyRate, repeat, quote.dueDate, JSON.stringify(quote), String(PRODUCT.offerValidDays)],
      );
      const loanId = loan.rows[0].id;
      await audit(c, { actorId: admin.id, action: "APPLICATION_APPROVED", entity: "application", entityId: app.id, metadata: { loan: reference, amount: quote.principal, dueDate: quote.dueDate }, ip });
      await notify(
        c,
        app.user_id,
        "You're approved — review and sign",
        `We can offer you ${formatRand(quote.principal, { cents: false })}, repayable as ${formatRand(quote.totalRepayable)} on ${formatDate(quote.dueDate)}. Review and sign within ${PRODUCT.offerValidDays} days.`,
        `/dashboard/loans/${loanId}`,
      );
    });
  } catch (e) {
    if ((e as Error).message === "state") return { error: "This application was already decided." };
    throw e;
  }
  await sms(app.user_id, `Airdvance: your application ${app.reference} is approved. Log in to review and sign your agreement.`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${app.id}`);
}

export async function declineApplication(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(form.get("applicationId"));
  const reason = String(form.get("reason") ?? "").trim();
  const bureau = String(form.get("bureau") ?? "").trim();
  if (reason.length < 10) return { error: "Give the customer a clear reason (at least 10 characters)." };
  const app = await loadApp(id);
  if (!app || !["SUBMITTED", "MORE_INFO_REQUIRED"].includes(app.status)) return { error: "This application can't be declined now." };
  const full = bureau ? `${reason}\n\nCredit bureau consulted: ${bureau}.` : reason;
  await tx(async (c) => {
    await c.query(
      "update applications set status = 'DECLINED', decision_reason = $2, decided_at = now(), decided_by = $3, updated_at = now() where id = $1",
      [id, full, admin.id],
    );
    await audit(c, { actorId: admin.id, action: "APPLICATION_DECLINED", entity: "application", entityId: id, metadata: { reason, bureau }, ip: clientIp() });
    await notify(c, app.user_id, "Update on your application", `We couldn't approve application ${app.reference}. Tap to see why.`, `/dashboard/applications/${id}`);
  });
  await sms(app.user_id, `Airdvance: we couldn't approve application ${app.reference}. Log in to see the reason.`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${id}`);
}

export async function requestInfo(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(form.get("applicationId"));
  const message = String(form.get("message") ?? "").trim();
  if (message.length < 10) return { error: "Tell the customer exactly what you need." };
  const app = await loadApp(id);
  if (!app || app.status !== "SUBMITTED") return { error: "Only submitted applications can be sent back." };
  await tx(async (c) => {
    await c.query("update applications set status = 'MORE_INFO_REQUIRED', info_request = $2, updated_at = now() where id = $1", [id, message]);
    await audit(c, { actorId: admin.id, action: "INFO_REQUESTED", entity: "application", entityId: id, metadata: { message }, ip: clientIp() });
    await notify(c, app.user_id, "We need more information", message, `/dashboard/applications/${id}`);
  });
  await sms(app.user_id, `Airdvance: we need a bit more information for application ${app.reference}. Please log in to respond.`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/applications/${id}`);
}

export async function addNote(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("applicationId"));
  const note = String(form.get("note") ?? "").trim().slice(0, 2000);
  if (note) {
    await query("update applications set admin_notes = admin_notes || $2::jsonb, updated_at = now() where id = $1", [
      id,
      JSON.stringify([{ at: new Date().toISOString(), by: admin.full_name, note }]),
    ]);
  }
  revalidatePath(`/admin/applications/${id}`);
}

export async function disburseLoan(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(form.get("loanId"));
  const raw = await one<LoanRow>("select * from loans where id = $1", [id]);
  if (!raw || raw.status !== "ACCEPTED") return { error: "Only signed loans awaiting payout can be paid out." };
  const loan = normaliseLoan(raw);
  const today = todaySA();
  if (daysBetween(today, loan.due_date) < 1) return { error: "The repayment date has passed or is today. Cancel this loan and ask the customer to reapply." };
  const app = (await loadApp(loan.application_id))!;

  // Re-price from the actual payout date: fewer days, never more than the signed offer.
  const final = calculateQuote({
    principal: Number(loan.principal),
    startDate: today,
    dueDate: loan.due_date,
    isRepeatThisYear: loan.is_repeat_this_year,
    allowShortTerm: true,
  });
  if (isQuoteError(final)) return { error: final.error };
  if (final.totalRepayable > loan.offer_quote.totalRepayable) return { error: "Re-priced total would exceed the signed offer." };

  const payout = await payments().payout({
    loanReference: loan.reference,
    accountHolder: app.bank.accountHolder,
    bankName: app.bank.bankName,
    branchCode: app.bank.branchCode,
    accountNumber: decrypt(app.bank_account_enc),
    amount: Number(loan.principal),
  });
  if (!payout.ok) return { error: `Payout failed: ${payout.message ?? "unknown error"}` };

  await tx(async (c) => {
    await c.query(
      `update loans set status = 'ACTIVE', disbursed_on = $2, final_quote = $3, payout_reference = $4, updated_at = now() where id = $1`,
      [loan.id, today, JSON.stringify(final), payout.reference],
    );
    await c.query("insert into transactions (loan_id, type, amount, method, reference, created_by) values ($1,'DISBURSEMENT',$2,'EFT',$3,$4)", [
      loan.id,
      loan.principal,
      payout.reference,
      admin.id,
    ]);
    await audit(c, { actorId: admin.id, action: "LOAN_DISBURSED", entity: "loan", entityId: loan.id, metadata: { payout: payout.reference, total: final.totalRepayable }, ip: clientIp() });
    await notify(
      c,
      loan.user_id,
      "Your money is on its way",
      `We've paid ${formatRand(Number(loan.principal))} into your ${app.bank.bankName} account. ${formatRand(final.totalRepayable)} will be collected on ${formatDate(loan.due_date)}.`,
      `/dashboard/loans/${loan.id}`,
    );
  });
  await sms(loan.user_id, `Airdvance: ${formatRand(Number(loan.principal))} has been paid to your account. Repay ${formatRand(final.totalRepayable)} on ${formatDate(loan.due_date)}.`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/loans/${loan.id}?done=paid`);
}

async function applyPayment(adminId: string, loan: LoanRow, amount: number, method: string, reference: string | null, note?: string) {
  const bal = loanBalance(loan)!;
  const paidAfter = round2(Number(loan.amount_paid) + amount);
  const settled = paidAfter + 0.005 >= bal.totalCharged;
  await tx(async (c) => {
    await c.query("insert into transactions (loan_id, type, amount, method, reference, note, created_by) values ($1,'REPAYMENT',$2,$3,$4,$5,$6)", [
      loan.id,
      amount,
      method,
      reference,
      note ?? null,
      adminId,
    ]);
    await c.query(
      `update loans set amount_paid = $2, status = case when $3 then 'SETTLED' else status end,
         settled_at = case when $3 then now() else settled_at end, updated_at = now() where id = $1`,
      [loan.id, paidAfter, settled],
    );
    await audit(c, { actorId: adminId, action: "REPAYMENT_RECORDED", entity: "loan", entityId: loan.id, metadata: { amount, method, reference, settled } });
    await notify(
      c,
      loan.user_id,
      settled ? "Loan settled — thank you" : "Payment received",
      settled ? `Loan ${loan.reference} is fully settled.` : `We received ${formatRand(amount)} towards loan ${loan.reference}.`,
      `/dashboard/loans/${loan.id}`,
    );
  });
  return settled;
}

export async function recordRepayment(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(form.get("loanId"));
  const amount = round2(Number(form.get("amount")));
  const method = String(form.get("method") ?? "EFT");
  const reference = String(form.get("reference") ?? "").trim() || null;
  const raw = await one<LoanRow>("select * from loans where id = $1", [id]);
  if (!raw || !["ACTIVE", "ARREARS"].includes(raw.status)) return { error: "Payments can only be recorded on active loans." };
  const loan = normaliseLoan(raw);
  const bal = loanBalance(loan)!;
  if (!(amount > 0)) return { error: "Enter a positive amount." };
  if (amount > bal.outstanding + 0.005) return { error: `That's more than the ${formatRand(bal.outstanding)} outstanding today.` };
  const settled = await applyPayment(admin.id, loan, amount, method, reference, String(form.get("note") ?? ""));
  revalidatePath("/admin", "layout");
  redirect(`/admin/loans/${loan.id}?done=${settled ? "settled" : "payment"}`);
}

export async function collectDebitOrder(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const raw = await one<LoanRow>("select * from loans where id = $1", [String(form.get("loanId"))]);
  if (!raw || !["ACTIVE", "ARREARS"].includes(raw.status)) return { error: "Only active loans can be collected." };
  const loan = normaliseLoan(raw);
  if (!loan.mandate_reference) return { error: "No DebiCheck mandate on this loan." };
  const bal = loanBalance(loan)!;
  const res = await payments().collect({ loanReference: loan.reference, mandateReference: loan.mandate_reference, amount: bal.outstanding });
  if (!res.ok) {
    await audit(null, { actorId: admin.id, action: "COLLECTION_FAILED", entity: "loan", entityId: loan.id, metadata: { message: res.message } });
    return { error: `Collection failed: ${res.message ?? "unknown"}` };
  }
  const settled = await applyPayment(admin.id, loan, bal.outstanding, "DebiCheck", res.reference ?? null);
  revalidatePath("/admin", "layout");
  redirect(`/admin/loans/${loan.id}?done=${settled ? "settled" : "payment"}`);
}

export async function cancelLoan(_prev: FormState, form: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const id = String(form.get("loanId"));
  const reason = String(form.get("reason") ?? "").trim();
  if (reason.length < 5) return { error: "Give a reason." };
  const row = await one<{ user_id: string; reference: string }>(
    "update loans set status = 'CANCELLED', updated_at = now() where id = $1 and status in ('OFFERED','ACCEPTED') returning user_id, reference",
    [id],
  );
  if (!row) return { error: "Only loans that haven't been paid out can be cancelled." };
  await audit(null, { actorId: admin.id, action: "LOAN_CANCELLED", entity: "loan", entityId: id, metadata: { reason }, ip: clientIp() });
  await notify(null, row.user_id, "Loan cancelled", `Loan ${row.reference} was cancelled before payout: ${reason}. Nothing is owed.`, `/dashboard/loans/${id}`);
  revalidatePath("/admin", "layout");
  redirect(`/admin/loans/${id}?done=cancelled`);
}

export async function markMessageHandled(form: FormData) {
  await requireAdmin();
  await query("update contact_messages set handled_at = now() where id = $1", [String(form.get("id"))]);
  revalidatePath("/admin/messages");
}

export async function revealSensitive(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("applicationId"));
  await audit(null, { actorId: admin.id, action: "SENSITIVE_REVEALED", entity: "application", entityId: id, ip: clientIp() });
  redirect(`/admin/applications/${id}?reveal=1`);
}

/** Default due date for an approval: the customer's chosen payday, unless it's now too close. */
export async function suggestDueDate(requested: string): Promise<string> {
  const today = todaySA();
  const d = daysBetween(today, requested);
  if (d >= PRODUCT.minDays && d <= PRODUCT.maxDays) return requested;
  return addDays(requested, 30) <= addDays(today, PRODUCT.maxDays) ? addDays(requested, 30) : addDays(today, PRODUCT.maxDays);
}
