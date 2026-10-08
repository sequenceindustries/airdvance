import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm } from "@/components/action-form";
import { Alert, StatusBadge } from "@/components/ui";
import { addNote, approveApplication, declineApplication, requestInfo, revealSensitive, suggestDueDate } from "@/lib/actions/admin";
import { PRODUCT } from "@/lib/config";
import { decrypt } from "@/lib/crypto";
import { one, query } from "@/lib/db";
import { addDays, formatDate, formatDateTime, todaySA } from "@/lib/dates";
import { formatAddress, normaliseApplication, type ApplicationRow } from "@/lib/loans";
import { formatRand } from "@/lib/pricing";
import { displayMobile } from "@/lib/sa";

export default async function AdminApplication({ params, searchParams }: { params: { id: string }; searchParams: { reveal?: string } }) {
  const raw = await one<ApplicationRow & { full_name: string; email: string; mobile: string; customer_since: string }>(
    `select a.*, u.full_name, u.email, u.mobile, u.created_at as customer_since from applications a join users u on u.id = a.user_id where a.id = $1`,
    [params.id],
  ).catch(() => null);
  if (!raw) notFound();
  const app = { ...normaliseApplication(raw), full_name: raw.full_name, email: raw.email, mobile: raw.mobile, customer_since: raw.customer_since };
  const docs = await query<{ id: string; kind: string; filename: string; size_bytes: number; created_at: string }>(
    "select id, kind, filename, size_bytes, created_at from documents where application_id = $1 order by created_at",
    [app.id],
  );
  const history = await query<{ id: string; reference: string; status: string; principal: string; created_at: string }>(
    `select l.id, l.reference, l.status, l.principal, l.created_at from loans l where l.user_id = $1 order by l.created_at desc`,
    [app.user_id],
  );
  const loan = await one<{ id: string; reference: string }>("select id, reference from loans where application_id = $1", [app.id]);
  const reveal = searchParams.reveal === "1";
  const a = app.affordability;
  const f = app.finances;
  const today = todaySA();
  const due = await suggestDueDate(app.requested_due_date);

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="text-sm text-ink-muted hover:text-ink">← Applications</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">{app.reference} · submitted {formatDateTime(app.submitted_at)}</p>
          <h1 className="mt-1 text-3xl font-semibold">{app.full_name}</h1>
          <p className="mt-1 text-ink-muted">
            Requests {formatRand(Number(app.requested_amount), { cents: false })} until {formatDate(app.requested_due_date)} · quoted total{" "}
            {formatRand(app.quote.totalRepayable)}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      {loan && (
        <Alert tone="info">
          Loan <Link href={`/admin/loans/${loan.id}`} className="underline">{loan.reference}</Link> was created from this application.
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Affordability */}
          <section className={`glass p-5 ${a.passes ? "" : "border-rose/40"}`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Affordability (declared)</h2>
              <span className={`badge ${a.passes ? "border-mint/40 text-mint-300" : "border-rose/40 text-rose-300"}`}>{a.passes ? "Passes" : "Fails"}</span>
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <KV k="Gross income" v={formatRand(f.grossIncome)} />
              <KV k="Net income" v={formatRand(f.netIncome)} />
              <KV k="Declared living expenses" v={formatRand(a.declaredLiving)} />
              <KV k="Minimum expense norm" v={formatRand(a.norm)} />
              <KV k="Living expenses used" v={formatRand(a.livingUsed)} />
              <KV k="Existing debt repayments" v={formatRand(a.debtRepayments)} />
              <KV k="Disposable income" v={formatRand(a.disposable)} />
              <KV k="This repayment" v={formatRand(a.repayment)} />
              <KV k="Left after repayment" v={formatRand(a.headroomAfterRepayment)} strong />
              <KV k="Repayment / net income" v={`${a.repaymentToNetPct}%`} />
            </dl>
            {a.flags.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-amber">
                {a.flags.map((x) => <li key={x}>{x}</li>)}
              </ul>
            )}
            <p className="mt-4 text-xs text-ink-faint">Verify income against the payslip and 3 salary deposits on the statements, and check the bureau report before deciding.</p>
          </section>

          {/* Details */}
          <section className="glass p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Customer details</h2>
              {!reveal && (
                <form action={revealSensitive}>
                  <input type="hidden" name="applicationId" value={app.id} />
                  <button className="text-xs text-ember-300 hover:underline">Reveal ID & account number (logged)</button>
                </form>
              )}
            </div>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <KV k="ID number" v={reveal ? decrypt(app.id_number_enc) : `•••••••••${app.id_number_last4}`} mono />
              <KV k="Date of birth" v={formatDate(app.date_of_birth, { weekday: false })} />
              <KV k="Mobile" v={displayMobile(app.mobile)} />
              <KV k="Email" v={app.email} />
              <KV k="SA citizen (per ID)" v={app.personal.citizen ? "Yes" : "No — permanent resident"} />
              <KV k="Address" v={formatAddress(app.address)} />
              <KV k="Employer" v={app.employment.employer ?? "—"} />
              <KV k="Bank" v={`${app.bank.bankName} · ${app.bank.accountType}`} />
              <KV k="Account holder" v={app.bank.accountHolder} />
              <KV k="Account number" v={reveal ? decrypt(app.bank_account_enc) : `••••${app.bank.last4}`} mono />
              <KV k="Branch code" v={app.bank.branchCode} mono />
              <KV k="Customer since" v={formatDateTime(app.customer_since)} />
            </dl>
            <p className="mt-4 text-xs text-ink-faint">
              Credit-check consent and declaration accepted {formatDateTime(app.consents.at)} from IP {app.consents.ip || "unknown"}.
            </p>
          </section>

          <section className="glass p-5">
            <h2 className="font-semibold">Documents</h2>
            <ul className="mt-3 divide-y divide-ink/[0.06] text-sm">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <a href={`/api/documents/${d.id}`} target="_blank" className="truncate text-ember-300 hover:underline">{d.filename}</a>
                  <span className="shrink-0 text-xs text-ink-faint">{d.kind.replace("_", " ")} · {(d.size_bytes / 1024).toFixed(0)} KB</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass p-5">
            <h2 className="font-semibold">Notes</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {app.admin_notes.length === 0 && <li className="text-ink-muted">No notes yet.</li>}
              {app.admin_notes.map((n, i) => (
                <li key={i}>
                  <p className="whitespace-pre-line">{n.note}</p>
                  <p className="text-xs text-ink-faint">{n.by} · {formatDateTime(n.at)}</p>
                </li>
              ))}
            </ul>
            <form action={addNote} className="mt-4 flex gap-2">
              <input type="hidden" name="applicationId" value={app.id} />
              <input name="note" className="input" placeholder="Add an internal note" />
              <button className="btn-ghost shrink-0">Add</button>
            </form>
          </section>
        </div>

        {/* Decisions */}
        <div className="space-y-6">
          {app.status === "SUBMITTED" ? (
            <>
              <section className="glass p-5">
                <h2 className="font-semibold">Approve</h2>
                <div className="mt-4">
                  <ActionForm action={approveApplication} hidden={{ applicationId: app.id }} submit="Approve and send offer">
                    <label className="block">
                      <span className="label">Amount</span>
                      <select name="amount" className="input" defaultValue={Number(app.requested_amount)}>
                        {Array.from({ length: (Number(app.requested_amount) - PRODUCT.minAmount) / PRODUCT.step + 1 }, (_, i) => PRODUCT.minAmount + i * PRODUCT.step)
                          .reverse()
                          .map((v) => <option key={v} value={v}>{formatRand(v, { cents: false })}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="label">Repayment date</span>
                      <input type="date" name="dueDate" className="input" defaultValue={due} min={addDays(today, PRODUCT.minDays)} max={addDays(today, PRODUCT.maxDays)} />
                    </label>
                    <label className="block">
                      <span className="label">Note (internal)</span>
                      <input name="note" className="input" placeholder="e.g. TransUnion score 612, salary R14,200 x3 verified" />
                    </label>
                    <label className="flex items-start gap-2 text-sm text-ink-muted">
                      <input type="checkbox" name="verified" className="mt-0.5 h-4 w-4 accent-ember" />
                      I've verified ID, income (payslip + statements), bank account ownership and the credit bureau report.
                    </label>
                  </ActionForm>
                </div>
              </section>
              <section className="glass p-5">
                <h2 className="font-semibold">Ask for more information</h2>
                <div className="mt-4">
                  <ActionForm action={requestInfo} hidden={{ applicationId: app.id }} submit="Send request" submitClass="btn-ghost">
                    <textarea name="message" rows={3} className="input" placeholder="e.g. Your bank statement for August is missing. Please upload it." />
                  </ActionForm>
                </div>
              </section>
            </>
          ) : (
            <section className="glass p-5 text-sm text-ink-muted">
              <h2 className="font-semibold text-ink">Decision</h2>
              <p className="mt-2">
                {app.status === "MORE_INFO_REQUIRED" && <>Waiting for the customer: “{app.info_request}”</>}
                {app.status === "APPROVED" && <>Approved {app.decided_at ? formatDateTime(app.decided_at) : ""}.</>}
                {app.status === "DECLINED" && <span className="whitespace-pre-line">Declined: {app.decision_reason}</span>}
                {app.status === "WITHDRAWN" && <>Withdrawn by the customer.</>}
              </p>
            </section>
          )}
          {["SUBMITTED", "MORE_INFO_REQUIRED"].includes(app.status) && (
            <section className="glass p-5">
              <h2 className="font-semibold">Decline</h2>
              <div className="mt-4">
                <ActionForm action={declineApplication} hidden={{ applicationId: app.id }} submit="Decline application" submitClass="btn-danger" confirm="Decline this application? The customer will be notified.">
                  <textarea name="reason" rows={3} className="input" placeholder="Reason shown to the customer, e.g. The repayment isn't affordable based on your income and expenses." />
                  <select name="bureau" className="input" defaultValue="">
                    <option value="">No credit bureau used</option>
                    <option>TransUnion</option>
                    <option>Experian</option>
                    <option>XDS</option>
                    <option>VeriCred</option>
                  </select>
                </ActionForm>
              </div>
            </section>
          )}
          <section className="glass p-5">
            <h2 className="font-semibold">Customer loan history</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">First-time customer.</p>
            ) : (
              <ul className="mt-3 divide-y divide-ink/[0.06] text-sm">
                {history.map((h) => (
                  <li key={h.id} className="flex justify-between py-2">
                    <Link href={`/admin/loans/${h.id}`} className="hover:underline">{h.reference}</Link>
                    <span className="flex items-center gap-2">{formatRand(Number(h.principal), { cents: false })} <StatusBadge status={h.status} /></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function KV({ k, v, strong, mono }: { k: string; v: string; strong?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ink/[0.04] py-1">
      <dt className="text-ink-muted">{k}</dt>
      <dd className={`text-right ${strong ? "font-semibold" : ""} ${mono ? "font-mono" : ""}`}>{v}</dd>
    </div>
  );
}
