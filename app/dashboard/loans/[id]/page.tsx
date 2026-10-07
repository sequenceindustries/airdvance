import Link from "next/link";
import { notFound } from "next/navigation";
import { SignOffer } from "./sign-offer";
import { AgreementClauses, AgreementTerms } from "@/components/agreement";
import { Alert, StatusBadge } from "@/components/ui";
import { requireVerifiedUser } from "@/lib/auth";
import { COLLECTION_ACCOUNT, COMPANY } from "@/lib/config";
import { one, query } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/dates";
import { loanBalance, normaliseApplication, normaliseLoan, type ApplicationRow, type LoanRow } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";
import { displayMobile } from "@/lib/sa";
import { declineOffer } from "@/lib/actions/customer";

export const metadata = { title: "Your loan" };

export default async function LoanPage({ params, searchParams }: { params: { id: string }; searchParams: { signed?: string } }) {
  const user = await requireVerifiedUser();
  const raw = await one<LoanRow>("select * from loans where id = $1 and user_id = $2", [params.id, user.id]).catch(() => null);
  if (!raw) notFound();
  const loan = normaliseLoan(raw);
  const app = normaliseApplication((await one<ApplicationRow>("select * from applications where id = $1", [loan.application_id]))!);
  const txns = await query<{ id: string; type: string; amount: string; method: string | null; reference: string | null; created_at: string }>(
    "select * from transactions where loan_id = $1 order by created_at",
    [loan.id],
  );
  const quote = loan.final_quote ?? loan.offer_quote;
  const bal = loanBalance(loan);
  const address = `${app.address.street}, ${app.address.suburb}, ${app.address.city}, ${app.address.postalCode}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard" className="text-sm text-ink-muted hover:text-ink">← My account</Link>
      {searchParams.signed && <Alert tone="success">Signed. We'll let you know as soon as the money has been paid into your account.</Alert>}

      <div className="glass relative overflow-hidden p-6">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">Loan {loan.reference}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold">{formatRand(Number(loan.principal), { cents: false })}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Repay {formatRand(quote.totalRepayable)} on {formatDate(loan.due_date)}
            </p>
          </div>
          <StatusBadge status={loan.status} />
        </div>
      </div>

      {loan.status === "OFFERED" && (
        <>
          <div className="glass p-6">
            <h2 className="text-xl font-semibold">Your pre-agreement statement and quotation</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {Number(loan.principal) < Number(app.requested_amount)
                ? `Based on our assessment we can offer ${formatRand(Number(loan.principal), { cents: false })} (you asked for ${formatRand(Number(app.requested_amount), { cents: false })}). `
                : "Good news — you're approved. "}
              Read these terms carefully. This offer is valid until {formatDateTime(loan.offer_expires_at)}. If we pay out later than today,
              you'll be charged for fewer days, so the total can only go down.
            </p>
            <div className="mt-5">
              <AgreementTerms
                quote={loan.offer_quote}
                reference={loan.reference}
                customer={{ name: user.full_name, idLast4: app.id_number_last4, mobile: displayMobile(user.mobile), address }}
                bank={{ bankName: app.bank.bankName, last4: app.bank.last4 }}
              />
            </div>
            <h3 className="mt-6 font-semibold">Key terms</h3>
            <div className="mt-3">
              <AgreementClauses />
            </div>
          </div>
          <div className="glass p-6">
            <h2 className="text-xl font-semibold">Sign your agreement</h2>
            <p className="mt-2 text-sm text-ink-muted">
              After you sign, your bank will ask you to approve a DebiCheck mandate for {formatRand(loan.offer_quote.totalRepayable)} on{" "}
              {formatDate(loan.due_date)} — usually in your banking app. Approve it so we can pay out.
            </p>
            <div className="mt-5">
              <SignOffer loanId={loan.id} fullName={user.full_name} />
            </div>
            <form action={declineOffer} className="mt-4 text-center">
              <input type="hidden" name="loanId" value={loan.id} />
              <button className="text-sm text-ink-faint underline hover:text-ink">No thanks, I don't want this loan</button>
            </form>
          </div>
        </>
      )}

      {loan.status === "ACCEPTED" && (
        <div className="glass p-6 text-sm text-ink-muted">
          <h2 className="text-lg font-semibold text-ink">Waiting for payout</h2>
          <p className="mt-2">
            You signed on {formatDateTime(loan.signed_at!)}. If your bank asked you to approve the DebiCheck mandate, please make sure
            you did. We'll pay {formatRand(Number(loan.principal))} into your {app.bank.bankName} account ending {app.bank.last4} once our
            final checks are done.
          </p>
        </div>
      )}

      {(loan.status === "ACTIVE" || loan.status === "ARREARS") && bal && (
        <>
          {loan.status === "ARREARS" && (
            <Alert tone="error">
              Your repayment was due on {formatDate(loan.due_date)}. Please settle as soon as you can, or contact us to discuss your options
              — we'll work with you.
            </Alert>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass p-6">
              <p className="text-sm text-ink-muted">To settle today</p>
              <p className="mt-1 font-display text-3xl font-semibold">{formatRand(bal.outstanding)}</p>
              <dl className="mt-4 space-y-1.5 text-sm">
                {[
                  ["Amount borrowed", bal.principal],
                  ["Initiation fee", bal.initiationFee],
                  [`Service fee (${bal.daysElapsed} days)`, bal.serviceFee],
                  [`Interest (${bal.daysElapsed} days)`, bal.interest],
                  ...(bal.lateInterest ? [[`Interest since due date (${bal.daysLate} days)`, bal.lateInterest]] : []),
                  ["Paid so far", -bal.paid],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-3">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="tabular-nums">{formatRand(v as number)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="glass p-6 text-sm text-ink-muted">
              <h2 className="text-lg font-semibold text-ink">How to pay</h2>
              <p className="mt-2">
                On {formatDate(loan.due_date)} we'll collect {formatRand(quote.totalRepayable)} by DebiCheck. To settle early, pay the amount
                on the left by EFT and email proof to {COMPANY.email}:
              </p>
              {COLLECTION_ACCOUNT.accountNumber ? (
                <dl className="mt-3 space-y-1 rounded-xl bg-ink/[0.04] p-3 font-mono text-xs text-ink">
                  <div>Bank: {COLLECTION_ACCOUNT.bank}</div>
                  <div>Account: {COLLECTION_ACCOUNT.accountName}</div>
                  <div>Number: {COLLECTION_ACCOUNT.accountNumber}</div>
                  <div>Branch: {COLLECTION_ACCOUNT.branchCode}</div>
                  <div>Reference: {loan.reference}</div>
                </dl>
              ) : (
                <p className="mt-3 rounded-xl bg-ink/[0.04] p-3 text-xs">Contact us for our banking details. Always use reference <strong className="text-ink">{loan.reference}</strong>.</p>
              )}
              <p className="mt-3 text-xs text-ink-faint">Always confirm our banking details with us directly — we'll never change them by email.</p>
            </div>
          </div>
        </>
      )}

      {loan.status === "SETTLED" && <Alert tone="success">Settled in full{loan.settled_at ? ` on ${formatDateTime(loan.settled_at)}` : ""}. Thank you!</Alert>}
      {loan.status === "EXPIRED" && <Alert tone="info">This offer expired before it was signed. You're welcome to apply again.</Alert>}
      {loan.status === "CANCELLED" && <Alert tone="info">This loan was cancelled before payout. Nothing is owed.</Alert>}

      {txns.length > 0 && (
        <div className="glass p-6">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <ul className="mt-3 divide-y divide-ink/[0.06] text-sm">
            {txns.map((t) => (
              <li key={t.id} className="flex justify-between gap-3 py-2.5">
                <span>
                  {t.type === "DISBURSEMENT" ? "Paid to you" : t.type === "REPAYMENT" ? "Payment received" : "Adjustment"}
                  <span className="ml-2 text-ink-faint">{formatDateTime(t.created_at)}</span>
                </span>
                <span className="tabular-nums">{formatRand(Number(t.amount))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loan.signed_at && (
        <p className="text-center text-sm">
          <Link href={`/dashboard/loans/${loan.id}/agreement`} className="text-ember-300 underline">View or print your signed agreement</Link>
        </p>
      )}
    </div>
  );
}
