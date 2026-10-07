import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { AgreementTerms } from "@/components/agreement";
import { Alert, StatusBadge } from "@/components/ui";
import { cancelLoan, collectDebitOrder, disburseLoan, recordRepayment } from "@/lib/actions/admin";
import { one, query } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/dates";
import { loanBalance, normaliseApplication, normaliseLoan, type ApplicationRow, type LoanRow } from "@/lib/loans";
import { isDemoPayments } from "@/lib/payments";
import { formatRand } from "@/lib/pricing";
import { displayMobile } from "@/lib/sa";

const DONE: Record<string, string> = {
  paid: "Paid out. The customer has been notified and the loan is now active.",
  payment: "Payment recorded.",
  settled: "Payment recorded — the loan is settled.",
  cancelled: "Loan cancelled. The customer has been notified.",
};

export default async function AdminLoan({ params, searchParams }: { params: { id: string }; searchParams: { done?: string } }) {
  const raw = await one<LoanRow & { full_name: string; mobile: string }>(
    "select l.*, u.full_name, u.mobile from loans l join users u on u.id = l.user_id where l.id = $1",
    [params.id],
  ).catch(() => null);
  if (!raw) notFound();
  const loan = normaliseLoan(raw);
  const app = normaliseApplication((await one<ApplicationRow>("select * from applications where id = $1", [loan.application_id]))!);
  const txns = await query<any>("select t.*, u.full_name as by from transactions t left join users u on u.id = t.created_by where loan_id = $1 order by t.created_at", [loan.id]);
  const log = await query<any>(
    `select g.*, u.full_name as by from audit_logs g left join users u on u.id = g.actor_id
      where (g.entity = 'loan' and g.entity_id = $1) or (g.entity = 'application' and g.entity_id = $2) order by g.created_at`,
    [loan.id, loan.application_id],
  );
  const bal = loanBalance(loan);
  const quote = loan.final_quote ?? loan.offer_quote;
  const demo = isDemoPayments();

  return (
    <div className="space-y-6">
      <Link href="/admin/loans" className="text-sm text-ink-muted hover:text-ink">← Loans</Link>
      {searchParams.done && DONE[searchParams.done] && <Alert tone="success">{DONE[searchParams.done]}</Alert>}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">
            {loan.reference} · from <Link href={`/admin/applications/${app.id}`} className="underline">{app.reference}</Link>
          </p>
          <h1 className="mt-1 text-3xl font-semibold">{raw.full_name}</h1>
          <p className="mt-1 text-ink-muted">
            {formatRand(Number(loan.principal), { cents: false })} · due {formatDate(loan.due_date)} · {displayMobile(raw.mobile)}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {bal && (
            <section className="glass p-5">
              <h2 className="font-semibold">Balance today</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {[
                  ["Principal", bal.principal],
                  ["Initiation fee", bal.initiationFee],
                  [`Service fee (${bal.daysElapsed}d)`, bal.serviceFee],
                  [`Interest (${bal.daysElapsed}d)`, bal.interest],
                  [`Late interest (${bal.daysLate}d, in duplum capped)`, bal.lateInterest],
                  ["Total charged", bal.totalCharged],
                  ["Paid", bal.paid],
                  ["Outstanding", bal.outstanding],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between border-b border-white/[0.04] py-1">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className={`tabular-nums ${k === "Outstanding" ? "font-semibold" : ""}`}>{formatRand(v as number)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          <section className="glass p-5">
            <h2 className="font-semibold">{loan.final_quote ? "Terms at payout" : "Offer terms"}</h2>
            <div className="mt-3">
              <AgreementTerms
                quote={quote}
                reference={loan.reference}
                customer={{ name: raw.full_name, idLast4: app.id_number_last4, mobile: displayMobile(raw.mobile), address: app.address.city }}
                bank={{ bankName: app.bank.bankName, last4: app.bank.last4 }}
              />
            </div>
            {loan.signed_at && (
              <p className="mt-3 text-xs text-ink-faint">
                Signed “{loan.signature_name}” {formatDateTime(loan.signed_at)} · mandate {loan.mandate_reference} ·{" "}
                <Link href={`/dashboard/loans/${loan.id}/agreement`} className="underline">agreement</Link>
              </p>
            )}
          </section>
          <section className="glass p-5">
            <h2 className="font-semibold">Transactions</h2>
            {txns.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">None yet.</p>
            ) : (
              <table className="table-x mt-2">
                <thead><tr><th>When</th><th>Type</th><th>Amount</th><th>Method / ref</th><th>By</th></tr></thead>
                <tbody>
                  {txns.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDateTime(t.created_at)}</td>
                      <td>{t.type}</td>
                      <td className="tabular-nums">{formatRand(Number(t.amount))}</td>
                      <td className="text-ink-muted">{t.method} {t.reference}</td>
                      <td className="text-ink-muted">{t.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="glass p-5">
            <h2 className="font-semibold">Audit trail</h2>
            <ul className="mt-3 space-y-1.5 text-xs text-ink-muted">
              {log.map((g) => (
                <li key={g.id}>
                  <span className="text-ink-faint">{formatDateTime(g.created_at)}</span> · <span className="text-ink">{g.action}</span> · {g.by ?? "system"}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          {loan.status === "OFFERED" && (
            <section className="glass p-5 text-sm text-ink-muted">
              <h2 className="font-semibold text-ink">Waiting for signature</h2>
              <p className="mt-2">Offer expires {formatDateTime(loan.offer_expires_at)}.</p>
            </section>
          )}
          {loan.status === "ACCEPTED" && (
            <section className="glass border-ember/40 p-5">
              <h2 className="font-semibold">Pay out</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Pays {formatRand(Number(loan.principal))} to {app.bank.bankName} ••••{app.bank.last4} and re-prices from today to the due date.
                {demo && " Demo mode: no money moves."}
              </p>
              <div className="mt-4">
                <ActionForm action={disburseLoan} hidden={{ loanId: loan.id }} submit="Pay out now" confirm={`Pay ${formatRand(Number(loan.principal))} to ${raw.full_name}?`} />
              </div>
            </section>
          )}
          {(loan.status === "OFFERED" || loan.status === "ACCEPTED") && (
            <section className="glass p-5">
              <h2 className="font-semibold">Cancel before payout</h2>
              <div className="mt-4">
                <ActionForm action={cancelLoan} hidden={{ loanId: loan.id }} submit="Cancel loan" submitClass="btn-danger" confirm="Cancel this loan?">
                  <input name="reason" className="input" placeholder="Reason (shown to customer)" />
                </ActionForm>
              </div>
            </section>
          )}
          {(loan.status === "ACTIVE" || loan.status === "ARREARS") && bal && (
            <>
              <section className="glass p-5">
                <h2 className="font-semibold">Collect by DebiCheck</h2>
                <p className="mt-2 text-sm text-ink-muted">Collects the outstanding {formatRand(bal.outstanding)} on mandate {loan.mandate_reference}.{demo && " Demo mode: no money moves."}</p>
                <div className="mt-4">
                  <ActionForm action={collectDebitOrder} hidden={{ loanId: loan.id }} submit="Run collection" submitClass="btn-ghost" confirm={`Collect ${formatRand(bal.outstanding)}?`} />
                </div>
              </section>
              <section className="glass p-5">
                <h2 className="font-semibold">Record a payment</h2>
                <div className="mt-4">
                  <ActionForm action={recordRepayment} hidden={{ loanId: loan.id }} submit="Record payment" submitClass="btn-ghost">
                    <input name="amount" inputMode="decimal" className="input" placeholder={`Amount (max ${bal.outstanding.toFixed(2)})`} />
                    <select name="method" className="input" defaultValue="EFT">
                      <option>EFT</option>
                      <option>DebiCheck</option>
                      <option>Cash deposit</option>
                    </select>
                    <input name="reference" className="input" placeholder="Bank reference" />
                    <input name="note" className="input" placeholder="Note (optional)" />
                  </ActionForm>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
