import { NextResponse } from "next/server";
import { clientIp, getCurrentUser } from "@/lib/auth";
import { smsEnabled } from "@/lib/messaging";
import { ApplicationSchema } from "@/lib/application-schema";
import { assessAffordability } from "@/lib/affordability";
import { encrypt } from "@/lib/crypto";
import { tx } from "@/lib/db";
import { todaySA } from "@/lib/dates";
import { insertDocs, prepareFiles, type DocKind } from "@/lib/documents";
import { isRepeatThisYear, openItemsFor } from "@/lib/loans";
import { calculateQuote, formatRand, isQuoteError } from "@/lib/pricing";
import { audit, makeReference, notify } from "@/lib/records";
import { SA_BANKS, parseSaId } from "@/lib/sa";

export const runtime = "nodejs";

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Your session has expired. Please log in again.", 401);
  if (smsEnabled() && !user.mobile_verified_at) return fail("Please confirm your cellphone number first.", 403);
  if (user.role !== "CUSTOMER") return fail("Admin accounts can't apply for loans.", 403);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("We couldn't read your upload. Please try again.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return fail("Something went wrong with your application data.");
  }
  const parsed = ApplicationSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const bank = SA_BANKS.find((b) => b.name === d.bank.bankName);
  if (!bank) return fail("Choose your bank from the list.");
  const id = parseSaId(d.idNumber);
  if (!id.valid) return fail(id.error ?? "Please check your ID number.");
  if ((id.age ?? 0) < 18) return fail("You must be 18 or older to apply.");

  const { app, loan } = await openItemsFor(user.id);
  if (app || loan) return fail("You already have an open application or loan. You can apply again once it's settled.", 409);

  const today = todaySA();
  const repeat = await isRepeatThisYear(user.id, today);
  const quote = calculateQuote({ principal: d.amount, startDate: today, dueDate: d.dueDate, isRepeatThisYear: repeat });
  if (isQuoteError(quote)) return fail(quote.error);

  // Files
  const entries: { kind: DocKind; file: File }[] = [];
  for (const [key, kind] of [
    ["doc_id", "ID"],
    ["doc_payslip", "PAYSLIP"],
    ["doc_statement", "BANK_STATEMENT"],
  ] as const) {
    for (const f of form.getAll(key)) if (f instanceof File) entries.push({ kind, file: f });
  }
  const need: DocKind[] = ["ID", "PAYSLIP", "BANK_STATEMENT"];
  for (const k of need) {
    if (!entries.some((e) => e.kind === k && e.file.size > 0)) {
      return fail(
        { ID: "Please upload your ID.", PAYSLIP: "Please upload your latest payslip.", BANK_STATEMENT: "Please upload your bank statements." }[k as "ID"],
      );
    }
  }
  const docs = await prepareFiles(entries);
  if ("error" in docs) return fail(docs.error);

  const affordability = assessAffordability(d.finances, quote.totalRepayable);
  const digits = d.idNumber.replace(/\D/g, "");
  const ip = clientIp();
  const consentStamp = { ...d.consents, at: new Date().toISOString(), ip };
  const reference = makeReference("AD");

  try {
    const appId = await tx(async (c) => {
      const res = await c.query(
        `insert into applications (reference, user_id, requested_amount, requested_due_date, quote, id_number_enc, id_number_last4,
            date_of_birth, personal, address, employment, finances, bank, bank_account_enc, consents, affordability)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning id`,
        [
          reference,
          user.id,
          d.amount,
          d.dueDate,
          JSON.stringify(quote),
          encrypt(digits),
          digits.slice(-4),
          id.dateOfBirth,
          JSON.stringify({ gender: id.gender, citizen: id.citizen }),
          JSON.stringify({ line: d.address }),
          JSON.stringify({ employer: d.employer }),
          JSON.stringify(d.finances),
          JSON.stringify({
            bankName: d.bank.bankName,
            accountHolder: user.full_name,
            branchCode: bank.branchCode,
            accountType: d.bank.accountType,
            last4: d.bank.accountNumber.slice(-4),
          }),
          encrypt(d.bank.accountNumber),
          JSON.stringify(consentStamp),
          JSON.stringify(affordability),
        ],
      );
      const appId = res.rows[0].id as string;
      await insertDocs(c, appId, user.id, docs);
      await audit(c, {
        actorId: user.id,
        action: "APPLICATION_SUBMITTED",
        entity: "application",
        entityId: appId,
        metadata: { reference, amount: d.amount, dueDate: d.dueDate, documents: docs.length },
        ip,
      });
      await notify(
        c,
        user.id,
        "Application received",
        `We've received application ${reference} for ${formatRand(d.amount, { cents: false })}. A member of our team will review it — we aim to respond within one business day.`,
        `/dashboard/applications/${appId}`,
      );
      return appId;
    });
    return NextResponse.json({ ok: true, id: appId });
  } catch (e) {
    console.error("[apply] failed", e);
    return fail("We couldn't save your application. Please try again.", 500);
  }
}
