"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { assessAffordability } from "@/lib/affordability";
import { PRODUCT } from "@/lib/config";
import { addDays, formatDate, isWeekend } from "@/lib/dates";
import { calculateQuote, formatRand, isQuoteError } from "@/lib/pricing";
import { SA_BANKS, parseSaId } from "@/lib/sa";
import { Alert } from "@/components/ui";
import { track } from "@/lib/analytics";

const STEPS = ["Amount", "You", "Income", "Bank", "Documents", "Confirm"] as const;

type Form = {
  amount: number;
  dueDate: string;
  idNumber: string;
  address: string;
  employer: string;
  grossIncome: string;
  netIncome: string;
  livingExpenses: string;
  debtRepayments: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
};

const n = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/[\s,R]/g, "")));

export function ApplyWizard({
  today,
  initialAmount,
  initialDue,
  fullName,
  isRepeat,
}: {
  today: string;
  initialAmount: number;
  initialDue: string;
  fullName: string;
  isRepeat: boolean;
}) {
  const router = useRouter();
  const top = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  useEffect(() => track("begin_application"), []);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<{ id: File[]; payslip: File[]; statement: File[] }>({ id: [], payslip: [], statement: [] });
  const [consents, setConsents] = useState({ creditCheck: false, declaration: false });
  const [f, setF] = useState<Form>({
    amount: initialAmount,
    dueDate: initialDue,
    idNumber: "",
    address: "",
    employer: "",
    grossIncome: "",
    netIncome: "",
    livingExpenses: "",
    debtRepayments: "",
    bankName: "",
    accountNumber: "",
    accountType: "Cheque / current",
  });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const quote = useMemo(
    () => calculateQuote({ principal: f.amount, startDate: today, dueDate: f.dueDate, isRepeatThisYear: isRepeat }),
    [f.amount, f.dueDate, today, isRepeat],
  );
  const id = useMemo(() => (f.idNumber.length === 13 ? parseSaId(f.idNumber) : null), [f.idNumber]);
  const finances = {
    grossIncome: n(f.grossIncome) || 0,
    netIncome: n(f.netIncome) || 0,
    livingExpenses: n(f.livingExpenses) || 0,
    debtRepayments: n(f.debtRepayments) || 0,
  };
  const afford =
    !isQuoteError(quote) && finances.netIncome > 0 && f.livingExpenses.trim() !== "" ? assessAffordability(finances, quote.totalRepayable) : null;

  function validate(s: number): string | null {
    switch (s) {
      case 0:
        return isQuoteError(quote) ? quote.error : null;
      case 1:
        if (!id) return "Enter your 13-digit ID number.";
        if (!id.valid) return id.error!;
        if ((id.age ?? 0) < 18) return "You must be 18 or older to apply.";
        if (f.address.trim().length < 8) return "Enter your home address.";
        return null;
      case 2:
        if (f.employer.trim().length < 2) return "Enter your employer's name.";
        if (!(n(f.grossIncome) > 0) || !(n(f.netIncome) > 0)) return "Enter both salary amounts, e.g. 12500.";
        if (n(f.netIncome) > n(f.grossIncome)) return "Salary paid in can't be more than salary before deductions.";
        if (!(n(f.livingExpenses) >= 0) || !(n(f.debtRepayments) >= 0)) return "Enter your expenses and debt repayments — use 0 if none.";
        return null;
      case 3:
        if (!f.bankName) return "Choose your bank.";
        if (!/^\d{6,16}$/.test(f.accountNumber)) return "Account numbers have 6 to 16 digits.";
        return null;
      case 4:
        if (!files.id.length) return "Add your ID.";
        if (!files.payslip.length) return "Add your latest payslip.";
        if (!files.statement.length) return "Add your bank statements.";
        return null;
      case 5:
        return consents.creditCheck && consents.declaration ? null : "Tick both boxes to submit.";
    }
    return null;
  }

  function go(to: number) {
    setError(null);
    setStep(to);
    track("application_step", { step: STEPS[to] });
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function next() {
    const e = validate(step);
    if (e) return setError(e);
    go(step + 1);
  }

  async function submit() {
    for (let s = 0; s < STEPS.length; s++) {
      const e = validate(s);
      if (e) {
        setStep(s);
        setError(e);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    const data = {
      amount: f.amount,
      dueDate: f.dueDate,
      idNumber: f.idNumber,
      address: f.address,
      employer: f.employer,
      finances,
      bank: { bankName: f.bankName, accountNumber: f.accountNumber, accountType: f.accountType },
      consents,
    };
    const body = new FormData();
    body.set("data", JSON.stringify(data));
    files.id.forEach((x) => body.append("doc_id", x));
    files.payslip.forEach((x) => body.append("doc_payslip", x));
    files.statement.forEach((x) => body.append("doc_statement", x));
    try {
      const res = await fetch("/api/applications", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      track("generate_lead");
      router.push(`/dashboard/applications/${json.id}?submitted=1`);
      router.refresh();
    } catch {
      setError("We couldn't connect. Check your signal and try again.");
      setSubmitting(false);
    }
  }

  const fill = ((f.amount - PRODUCT.minAmount) / (PRODUCT.maxAmount - PRODUCT.minAmount)) * 100;

  return (
    <div ref={top} className="scroll-mt-24">
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="font-medium text-ink">{STEPS[step]}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="glass p-5 sm:p-7">
          {error && (
            <div className="mb-5">
              <Alert tone="error">{error}</Alert>
            </div>
          )}

          {step === 0 && (
            <Section title="How much do you need?">
              <div className="flex items-baseline justify-between">
                <span className="label">Amount</span>
                <span className="font-display text-4xl font-semibold tabular-nums">{formatRand(f.amount, { cents: false })}</span>
              </div>
              <input
                type="range"
                aria-label="Amount"
                className="range mt-3"
                min={PRODUCT.minAmount}
                max={PRODUCT.maxAmount}
                step={PRODUCT.step}
                value={f.amount}
                style={{ ["--fill" as any]: `${fill}%` }}
                onChange={(e) => setF((s) => ({ ...s, amount: Number(e.target.value) }))}
              />
              <Field label="Your next payday" hint={isWeekend(f.dueDate) ? "That's a weekend — pick the day your salary arrives." : undefined}>
                <input type="date" className="input" min={addDays(today, PRODUCT.minDays)} max={addDays(today, PRODUCT.maxDays)} value={f.dueDate} onChange={set("dueDate")} />
              </Field>
            </Section>
          )}

          {step === 1 && (
            <Section title="About you">
              <Field label="SA ID number" hint={id?.valid ? `Born ${formatDate(id.dateOfBirth!, { weekday: false })}` : undefined}>
                <input
                  className="input font-mono tracking-wider"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={13}
                  value={f.idNumber}
                  onChange={(e) => setF((s) => ({ ...s, idNumber: e.target.value.replace(/\D/g, "") }))}
                />
              </Field>
              {id && !id.valid && <p className="-mt-2 text-sm text-rose-300">{id.error}</p>}
              <Field label="Home address">
                <input className="input" autoComplete="street-address" value={f.address} onChange={set("address")} placeholder="12 Mandela St, Soweto, 1804" />
              </Field>
            </Section>
          )}

          {step === 2 && (
            <Section title="Your income">
              <Field label="Employer">
                <input className="input" autoComplete="organization" value={f.employer} onChange={set("employer")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Money label="Salary before deductions" value={f.grossIncome} onChange={set("grossIncome")} />
                <Money label="Salary paid into your account" value={f.netIncome} onChange={set("netIncome")} />
                <Money label="Monthly living costs" hint="Rent, food, transport, bills" value={f.livingExpenses} onChange={set("livingExpenses")} />
                <Money label="Monthly debt repayments" hint="Loans, store and credit cards" value={f.debtRepayments} onChange={set("debtRepayments")} />
              </div>
              {afford && !afford.passes && (
                <Alert tone="warn">This repayment may be too much for your budget. Consider a smaller amount.</Alert>
              )}
            </Section>
          )}

          {step === 3 && (
            <Section title="Where should we pay you?">
              <Field label="Bank">
                <select className="input" value={f.bankName} onChange={set("bankName")}>
                  <option value="">Choose your bank</option>
                  {SA_BANKS.map((b) => (
                    <option key={b.name}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Account number">
                  <input
                    className="input font-mono"
                    inputMode="numeric"
                    autoComplete="off"
                    value={f.accountNumber}
                    onChange={(e) => setF((s) => ({ ...s, accountNumber: e.target.value.replace(/\D/g, "") }))}
                  />
                </Field>
                <Field label="Account type">
                  <select className="input" value={f.accountType} onChange={set("accountType")}>
                    <option>Cheque / current</option>
                    <option>Savings</option>
                  </select>
                </Field>
              </div>
              <p className="text-xs text-ink-faint">Must be in your name ({fullName}). We repay from the same account on payday.</p>
            </Section>
          )}

          {step === 4 && (
            <Section title="Add your documents" intro="PDFs or clear photos, up to 8 MB each.">
              <Upload label="ID (both sides of a smart ID)" files={files.id} onChange={(x) => setFiles((s) => ({ ...s, id: x }))} />
              <Upload label="Latest payslip" files={files.payslip} onChange={(x) => setFiles((s) => ({ ...s, payslip: x }))} />
              <Upload label="Bank statements, last 3 months" files={files.statement} onChange={(x) => setFiles((s) => ({ ...s, statement: x }))} />
            </Section>
          )}

          {step === 5 && !isQuoteError(quote) && (
            <Section title="Check and submit">
              <dl className="divide-y divide-ink/[0.07] rounded-2xl border border-ink/10 text-sm">
                {[
                  ["Amount", formatRand(quote.principal, { cents: false }), 0],
                  ["Repay", `${formatRand(quote.totalRepayable)} on ${formatDate(quote.dueDate, { weekday: false })}`, 0],
                  ["ID", `•••••••••${f.idNumber.slice(-4)}`, 1],
                  ["Salary paid in", formatRand(finances.netIncome, { cents: false }), 2],
                  ["Bank", `${f.bankName} ••••${f.accountNumber.slice(-4)}`, 3],
                  ["Documents", `${files.id.length + files.payslip.length + files.statement.length} files`, 4],
                ].map(([k, v, s]) => (
                  <div key={k as string} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="flex items-center gap-3 text-right">
                      <span>{v}</span>
                      <button type="button" onClick={() => go(s as number)} className="text-xs text-ember-300 hover:underline">
                        Edit
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
              <label className="flex items-start gap-3 text-sm text-ink-muted">
                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-ember" checked={consents.creditCheck} onChange={(e) => setConsents((c) => ({ ...c, creditCheck: e.target.checked }))} />
                <span>I agree to a credit check and to Airdvance verifying my ID, income and bank account.</span>
              </label>
              <label className="flex items-start gap-3 text-sm text-ink-muted">
                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-ember" checked={consents.declaration} onChange={(e) => setConsents((c) => ({ ...c, declaration: e.target.checked }))} />
                <span>
                  My details are true and complete, the account is mine, I&rsquo;m not under debt review, and I accept the{" "}
                  <Link href="/privacy" target="_blank" className="text-ember-300 underline">
                    privacy policy
                  </Link>
                  .
                </span>
              </label>
            </Section>
          )}

          <div className="mt-7 flex gap-3">
            {step > 0 && (
              <button type="button" onClick={() => go(step - 1)} className="btn-ghost" disabled={submitting}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="btn-primary flex-1 sm:flex-none sm:px-8">
                Continue
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={submitting} className="btn-primary flex-1 sm:flex-none sm:px-8">
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </div>

        <aside className="glass p-5 lg:sticky lg:top-24">
          <p className="text-sm font-medium text-ink-muted">Your quote</p>
          {isQuoteError(quote) ? (
            <p className="mt-3 text-sm text-rose-300">{quote.error}</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <Line k="You get" v={formatRand(quote.principal)} />
              <Line k="Fees and interest" v={formatRand(quote.costOfCredit)} />
              <div className="mt-3 border-t border-ink/10 pt-3">
                <Line k={`Repay ${formatDate(quote.dueDate, { weekday: false, year: false })}`} v={formatRand(quote.totalRepayable)} strong />
              </div>
            </dl>
          )}
          {isRepeat && <p className="mt-3 text-xs text-mint-300">Returning customer rate: 3% per month.</p>}
          <p className="mt-4 text-xs text-ink-faint">Subject to approval.</p>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {intro && <p className="mt-1.5 text-sm text-ink-muted">{intro}</p>}
      <div className="mt-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function Money({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">R</span>
        <input className="input pl-8 tabular-nums" inputMode="decimal" value={value} onChange={onChange} placeholder="0" />
      </div>
    </Field>
  );
}

function Upload({ label, files, onChange }: { label: string; files: File[]; onChange: (f: File[]) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-ink/15 p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {files.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-ember-300">
            {files.length === 1 ? files[0].name : `${files.length} files added`}
          </p>
        )}
      </div>
      <label className="btn-ghost btn-sm shrink-0 cursor-pointer">
        {files.length ? "Change" : "Add"}
        <input
          type="file"
          className="sr-only"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        />
      </label>
    </div>
  );
}

function Line({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className={strong ? "font-semibold text-ink" : "text-ink-muted"}>{k}</dt>
      <dd className={`tabular-nums ${strong ? "font-display text-lg font-semibold" : ""}`}>{v}</dd>
    </div>
  );
}
