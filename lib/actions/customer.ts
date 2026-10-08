"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clientIp, requireVerifiedUser } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { one, query, tx } from "@/lib/db";
import { normaliseApplication, normaliseLoan, type ApplicationRow, type LoanRow } from "@/lib/loans";
import { isDemoPayments, payments } from "@/lib/payments";
import { formatRand } from "@/lib/pricing";
import { audit, notify } from "@/lib/records";
import type { FormState } from "./auth";
import { flashEvent } from "@/lib/analytics-server";

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

export async function acceptOffer(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireVerifiedUser();
  const loanId = String(form.get("loanId"));
  const signature = String(form.get("signature") ?? "");
  const raw = await one<LoanRow>("select * from loans where id = $1 and user_id = $2", [loanId, user.id]);
  if (!raw) return { error: "Offer not found." };
  const loan = normaliseLoan(raw);
  if (loan.status !== "OFFERED") return { error: "This offer can no longer be signed." };
  if (new Date(loan.offer_expires_at) < new Date()) return { error: "This offer has expired. You're welcome to apply again." };
  for (const k of ["readStatement", "understandCost", "authoriseDebit"]) {
    if (form.get(k) !== "on") return { error: "Please tick each confirmation before signing." };
  }
  if (norm(signature) !== norm(user.full_name)) {
    return { error: `Type your full name exactly as on your account (${user.full_name}) to sign.` };
  }

  const app = normaliseApplication((await one<ApplicationRow>("select * from applications where id = $1", [loan.application_id]))!);
  // Debit orders are set up manually for now; keep the seam for a future provider.
  const mandate = isDemoPayments() ? { ok: true, reference: "MANUAL" } : await payments().createMandate({
    loanReference: loan.reference,
    accountHolder: app.bank.accountHolder,
    bankName: app.bank.bankName,
    branchCode: app.bank.branchCode,
    accountNumber: decrypt(app.bank_account_enc),
    accountType: app.bank.accountType,
    amount: loan.offer_quote.totalRepayable,
    collectionDate: loan.due_date,
    mobile: user.mobile,
  });
  if (!mandate.ok) return { error: "We couldn't register your debit order with the bank. Please try again or contact us." };

  const ip = clientIp();
  await tx(async (c) => {
    const res = await c.query(
      `update loans set status = 'ACCEPTED', signed_at = now(), signature_name = $2, signature_ip = $3,
              mandate_reference = $4, updated_at = now()
        where id = $1 and status = 'OFFERED' returning id`,
      [loan.id, signature.trim(), ip, mandate.reference],
    );
    if (!res.rowCount) throw new Error("Offer state changed");
    await audit(c, { actorId: user.id, action: "AGREEMENT_SIGNED", entity: "loan", entityId: loan.id, metadata: { mandate: mandate.reference }, ip });
    await notify(
      c,
      user.id,
      "Agreement signed",
      `Thanks — we'll pay ${formatRand(Number(loan.principal))} into your ${app.bank.bankName} account once our team has completed the final checks.`,
      `/dashboard/loans/${loan.id}`,
    );
  });
  flashEvent("sign_agreement");
  revalidatePath("/dashboard");
  redirect(`/dashboard/loans/${loan.id}?signed=1`);
}

export async function declineOffer(form: FormData) {
  const user = await requireVerifiedUser();
  const loanId = String(form.get("loanId"));
  const row = await one<{ id: string }>(
    "update loans set status = 'CANCELLED', updated_at = now() where id = $1 and user_id = $2 and status = 'OFFERED' returning id",
    [loanId, user.id],
  );
  if (row) await audit(null, { actorId: user.id, action: "OFFER_DECLINED", entity: "loan", entityId: loanId, ip: clientIp() });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function withdrawApplication(form: FormData) {
  const user = await requireVerifiedUser();
  const id = String(form.get("applicationId"));
  const row = await one<{ id: string }>(
    `update applications set status = 'WITHDRAWN', decided_at = now(), updated_at = now()
      where id = $1 and user_id = $2 and status in ('SUBMITTED','MORE_INFO_REQUIRED') returning id`,
    [id, user.id],
  );
  if (row) await audit(null, { actorId: user.id, action: "APPLICATION_WITHDRAWN", entity: "application", entityId: id, ip: clientIp() });
  revalidatePath("/dashboard");
  redirect(`/dashboard/applications/${id}`);
}

export async function markNotificationsRead() {
  const user = await requireVerifiedUser();
  await query("update notifications set read_at = now() where user_id = $1 and read_at is null", [user.id]);
  revalidatePath("/dashboard");
}
