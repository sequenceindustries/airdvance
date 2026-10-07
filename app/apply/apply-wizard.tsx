"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { assessAffordability } from "@/lib/affordability";
import { PRODUCT } from "@/lib/config";
import { addDays, formatDate, isWeekend } from "@/lib/dates";
import { calculateQuote, formatRand, isQuoteError } from "@/lib/pricing";
import { PROVINCES, SA_BANKS, parseSaId } from "@/lib/sa";
import { Alert } from "@/components/ui";

const STEPS = ["Loan", "About you", "Address", "Work & income", "Expenses", "Bank", "Documents", "Review"] as const;

type Form = {
  amount: number;
  dueDate: string;
  idNumber: string;
  maritalStatus: string;
  dependants: string;
  homeLanguage: string;
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  residentialStatus: string;
  yearsAtAddress: string;
  employer: string;
  employerPhone: string;
  occupation: string;
  employmentType: string;
  startDate: string;
  payFrequency: string;
  grossIncome: string;
  netIncome: string;
  housing: string;
  food: string;
  transport: string;
  utilities: string;
  education: string;
  otherExpenses: string;
  debtRepayments: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<{ id: File[]; payslip: File[]; statement: File[] }>({ id: [], payslip: [], statement: [] });
  const [consents, setConsents] = useState({ creditCheck: false, accurate: false, notUnderDebtReview: false, ownAccount: false, privacy: false });
  const [f, setF] = useState<Form>({
    amount: initialAmount,
    dueDate: initialDue,
    idNumber: "",
    maritalStatus: "",
    dependants: "0",
    homeLanguage: "",
    street: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    residentialStatus: "",
    yearsAtAddress: "",
    employer: "",
    employerPhone: "",
    occupation: "",
    employmentType: "",
    startDate: "",
    payFrequency: "Monthly",
    grossIncome: "",
    netIncome: "",
    housing: "",
    food: "",
    transport: "",
    utilities: "",
    education: "",
    otherExpenses: "",
    debtRepayments: "",
    bankName: "",
    accountHolder: fullName,
    accountNumber: "",
    branchCode: "",
    accountType: "",
  });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  const quote = useMemo(
    () => calculateQuote({ principal: f.amount, startDate: today, dueDate: f.dueDate, isRepeatThisYear: isRepeat }),
    [f.amount, f.dueDate, today, isRepeat],
  );
  const id = useMemo(() => (f.idNumber.replace(/\D/g, "").length === 13 ? parseSaId(f.idNumber) : null), [f.idNumber]);
  const finances = {
    grossIncome: n(f.grossIncome) || 0,
    netIncome: n(f.netIncome) || 0,
    housing: n(f.housing) || 0,
    food: n(f.food) || 0,
    transport: n(f.transport) || 0,
    utilities: n(f.utilities) || 0,
    education: n(f.education) || 0,
    otherExpenses: n(f.otherExpenses) || 0,
    debtRepayments: n(f.debtRepayments) || 0,
  };
  const afford = !isQuoteError(quote) && finances.netIncome > 0 ? assessAffordability(finances, quote.totalRepayable) : null;

  function validate(s: number): string | null {
    const req = (keys: (keyof Form)[], msg = "Please complete all the fields.") =>
      keys.some((k) => String(f[k]).trim() === "") ? msg : null;
    switch (s) {
      case 0:
        return isQuoteError(quote) ? quote.error : null;
      case 1:
        if (!id) return "Enter your 13-digit South African ID number.";
        if (!id.valid) return id.error!;
        if ((id.age ?? 0) < 18) return "You must be 18 or older to apply.";
        return req(["maritalStatus"]);
      case 2:
        if (!/^\d{4}$/.test(f.postalCode)) return req(["street", "suburb", "city", "province", "residentialStatus", "yearsAtAddress"]) ?? "Postal codes have 4 digits.";
        return req(["street", "suburb", "city", "province", "residentialStatus", "yearsAtAddress"]);
      case 3: {
        const r = req(["employer", "employerPhone", "occupation", "employmentType", "startDate", "payFrequency", "grossIncome", "netIncome"]);
        if (r) return r;
        if (!(n(f.grossIncome) > 0) || !(n(f.netIncome) > 0)) return "Enter your income as numbers, e.g. 12500.";
        if (n(f.netIncome) > n(f.grossIncome)) return "Take-home pay can't be more than your gross income.";
        return null;
      }
      case 4: {
        const r = req(["housing", "food", "transport", "utilities", "education", "otherExpenses", "debtRepayments"], "Enter an amount for each expense — use 0 if it doesn't apply.");
        if (r) return r;
        const bad = (["housing", "food", "transport", "utilities", "education", "otherExpenses", "debtRepayments"] as const).some((k) => !(n(f[k]) >= 0));
        return bad ? "Enter expenses as numbers, e.g. 3500." : null;
      }
      case 5:
        if (req(["bankName", "accountHolder", "accountNumber", "branchCode", "accountType"])) return "Please complete all the bank details.";
        if (!/^\d{6,16}$/.test(f.accountNumber.replace(/\s/g, ""))) return "Account numbers have 6 to 16 digits.";
        if (!/^\d{6}$/.test(f.branchCode)) return "Branch codes have 6 digits.";
        return null;
      case 6:
        if (!files.id.length) return "Please upload your ID.";
        if (!files.payslip.length) return "Please upload your latest payslip.";
        if (!files.statement.length) return "Please upload your bank statements for the last 3 months.";
        return null;
      case 7:
        return Object.values(consents).every(Boolean) ? null : "Please tick each declaration to continue.";
    }
    return null;
  }

  function go(to: number) {
    setError(null);
    setStep(to);
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
      personal: { idNumber: f.idNumber, maritalStatus: f.maritalStatus, dependants: f.dependants, homeLanguage: f.homeLanguage },
      address: {
        street: f.street,
        suburb: f.suburb,
        city: f.city,
        province: f.province,
        postalCode: f.postalCode,
        residentialStatus: f.residentialStatus,
        yearsAtAddress: f.yearsAtAddress,
      },
      employment: {
        employer: f.employer,
        employerPhone: f.employerPhone,
        occupation: f.occupation,
        employmentType: f.employmentType,
        startDate: f.startDate,
        payFrequency: f.payFrequency,
      },
      finances,
      bank: {
        bankName: f.bankName,
        accountHolder: f.accountHolder,
        accountNumber: f.accountNumber.replace(/\s/g, ""),
        branchCode: f.branchCode,
        accountType: f.accountType,
      },
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
      router.push(`/dashboard/applications/${json.id}?submitted=1`);
      router.refresh();
    } catch {
      setError("We couldn't reach our servers. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const fill = ((f.amount - PRODUCT.minAmount) / (PRODUCT.maxAmount - PRODUCT.minAmount)) * 100;

  return (
    <div ref={top} className="scroll-mt-24">
      {/* Progress */}
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
            <Section title="How much do you need?" intro="Borrow only what you need — the initiation fee is the same for every amount.">
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
              <Field label="Repayment date (your next payday)" hint={isWeekend(f.dueDate) ? "That's a weekend. Choose the day your salary actually reaches your account." : `Between ${formatDate(addDays(today, PRODUCT.minDays), { weekday: false })} and ${formatDate(addDays(today, PRODUCT.maxDays), { weekday: false })}.`}>
                <input type="date" className="input" min={addDays(today, PRODUCT.minDays)} max={addDays(today, PRODUCT.maxDays)} value={f.dueDate} onChange={set("dueDate")} />
              </Field>
            </Section>
          )}

          {step === 1 && (
            <Section title="About you" intro="We use your ID number to confirm who you are and to check your credit record.">
              <Field label="South African ID number" hint={id?.valid ? `Date of birth ${formatDate(id.dateOfBirth!, { weekday: false })} · age ${id.age}` : "13 digits, from your ID book or smart ID card."}>
                <input className="input font-mono tracking-wider" inputMode="numeric" autoComplete="off" maxLength={13} value={f.idNumber} onChange={(e) => setF((s) => ({ ...s, idNumber: e.target.value.replace(/\D/g, "") }))} />
              </Field>
              {id && !id.valid && <p className="-mt-2 text-sm text-rose-300">{id.error}</p>}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Marital status">
                  <Select value={f.maritalStatus} onChange={set("maritalStatus")} options={["Single", "Married", "Living together", "Divorced", "Widowed"]} />
                </Field>
                <Field label="Number of dependants">
                  <input type="number" min={0} max={20} inputMode="numeric" className="input" value={f.dependants} onChange={set("dependants")} />
                </Field>
              </div>
              <Field label="Home language (optional)">
                <Select value={f.homeLanguage} onChange={set("homeLanguage")} options={["English", "isiZulu", "isiXhosa", "Afrikaans", "Sepedi", "Setswana", "Sesotho", "Xitsonga", "siSwati", "Tshivenda", "isiNdebele", "Other"]} />
              </Field>
            </Section>
          )}

          {step === 2 && (
            <Section title="Where do you live?" intro="Your residential address, as it appears on your bank statement if possible.">
              <Field label="Street address">
                <input className="input" autoComplete="address-line1" value={f.street} onChange={set("street")} placeholder="12 Mandela Street" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Suburb">
                  <input className="input" autoComplete="address-level3" value={f.suburb} onChange={set("suburb")} />
                </Field>
                <Field label="City or town">
                  <input className="input" autoComplete="address-level2" value={f.city} onChange={set("city")} />
                </Field>
                <Field label="Province">
                  <Select value={f.province} onChange={set("province")} options={PROVINCES} />
                </Field>
                <Field label="Postal code">
                  <input className="input" inputMode="numeric" maxLength={4} autoComplete="postal-code" value={f.postalCode} onChange={set("postalCode")} />
                </Field>
                <Field label="Do you">
                  <Select value={f.residentialStatus} onChange={set("residentialStatus")} options={["Own", "Rent", "Living with family", "Employer provided"]} />
                </Field>
                <Field label="Years at this address">
                  <input type="number" min={0} max={80} step="0.5" inputMode="decimal" className="input" value={f.yearsAtAddress} onChange={set("yearsAtAddress")} />
                </Field>
              </div>
            </Section>
          )}

          {step === 3 && (
            <Section title="Work and income" intro="We'll check these against your payslip and bank statements.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Employer">
                  <input className="input" autoComplete="organization" value={f.employer} onChange={set("employer")} />
                </Field>
                <Field label="Employer phone number">
                  <input className="input" type="tel" inputMode="tel" value={f.employerPhone} onChange={set("employerPhone")} />
                </Field>
                <Field label="Job title">
                  <input className="input" autoComplete="organization-title" value={f.occupation} onChange={set("occupation")} />
                </Field>
                <Field label="Employment type">
                  <Select value={f.employmentType} onChange={set("employmentType")} options={["Permanent", "Fixed-term contract", "Part-time"]} />
                </Field>
                <Field label="Started working there">
                  <input type="month" className="input" max={today.slice(0, 7)} value={f.startDate} onChange={set("startDate")} />
                </Field>
                <Field label="How often are you paid?">
                  <Select value={f.payFrequency} onChange={set("payFrequency")} options={["Monthly", "Fortnightly", "Weekly"]} />
                </Field>
                <Money label="Gross monthly income" hint="Before tax and deductions" value={f.grossIncome} onChange={set("grossIncome")} />
                <Money label="Take-home pay per month" hint="What lands in your account" value={f.netIncome} onChange={set("netIncome")} />
              </div>
            </Section>
          )}

          {step === 4 && (
            <Section title="Your monthly expenses" intro="Be honest — this protects you. Include your share of household costs. Use 0 where something doesn't apply.">
              <div className="grid gap-4 sm:grid-cols-2">
                <Money label="Rent or bond" value={f.housing} onChange={set("housing")} />
                <Money label="Groceries & household" value={f.food} onChange={set("food")} />
                <Money label="Transport" hint="Taxi, fuel, bus" value={f.transport} onChange={set("transport")} />
                <Money label="Water, electricity, airtime & data" value={f.utilities} onChange={set("utilities")} />
                <Money label="School fees & childcare" value={f.education} onChange={set("education")} />
                <Money label="Other regular expenses" hint="Insurance, support for family, etc." value={f.otherExpenses} onChange={set("otherExpenses")} />
                <Money label="Existing debt repayments" hint="Store cards, loans, credit cards, car" value={f.debtRepayments} onChange={set("debtRepayments")} />
              </div>
              {afford && (
                <div className={`mt-2 rounded-2xl border p-4 text-sm ${afford.passes ? "border-mint/30 bg-mint/[0.07]" : "border-amber/40 bg-amber/10"}`}>
                  <p className="font-semibold text-ink">
                    Estimated money left this month after expenses and this repayment: {formatRand(afford.headroomAfterRepayment)}
                  </p>
                  <p className="mt-1 text-ink-muted">
                    {afford.passes
                      ? "This is an estimate. Our team still verifies your income and expenses before deciding."
                      : "Based on these figures the repayment may not be affordable. You can still apply, but please consider a smaller amount — or none at all."}
                    {afford.declaredLiving < afford.norm && " We've used the National Credit Regulator's minimum living-cost estimate for your income, which is higher than what you entered."}
                  </p>
                </div>
              )}
            </Section>
          )}

          {step === 5 && (
            <Section title="Your bank account" intro="We pay your cash into this account and collect the repayment from it with one DebiCheck debit order. It must be in your name.">
              <Field label="Bank">
                <select
                  className="input"
                  value={f.bankName}
                  onChange={(e) => {
                    const b = SA_BANKS.find((x) => x.name === e.target.value);
                    setF((s) => ({ ...s, bankName: e.target.value, branchCode: b?.branchCode ?? s.branchCode }));
                  }}
                >
                  <option value="">Choose your bank</option>
                  {SA_BANKS.map((b) => (
                    <option key={b.name}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Account holder">
                  <input className="input" value={f.accountHolder} onChange={set("accountHolder")} />
                </Field>
                <Field label="Account type">
                  <Select value={f.accountType} onChange={set("accountType")} options={["Cheque / current", "Savings", "Transmission"]} />
                </Field>
                <Field label="Account number">
                  <input className="input font-mono" inputMode="numeric" autoComplete="off" value={f.accountNumber} onChange={(e) => setF((s) => ({ ...s, accountNumber: e.target.value.replace(/[^\d\s]/g, "") }))} />
                </Field>
                <Field label="Branch code" hint="Filled in for you — change it only if your bank uses a different code.">
                  <input className="input font-mono" inputMode="numeric" maxLength={6} value={f.branchCode} onChange={set("branchCode")} />
                </Field>
              </div>
              <p className="text-xs text-ink-faint">We'll never ask for your online banking password or PIN.</p>
            </Section>
          )}

          {step === 6 && (
            <Section title="Upload your documents" intro="PDFs or clear phone photos, up to 8 MB each. Download bank statements as PDFs from your banking app.">
              <Upload label="ID document or smart ID card (both sides)" multiple files={files.id} onChange={(x) => setFiles((s) => ({ ...s, id: x }))} />
              <Upload label="Latest payslip" files={files.payslip} onChange={(x) => setFiles((s) => ({ ...s, payslip: x }))} multiple />
              <Upload label="Bank statements — last 3 months" hint="One file per month is fine." multiple files={files.statement} onChange={(x) => setFiles((s) => ({ ...s, statement: x }))} />
            </Section>
          )}

          {step === 7 && !isQuoteError(quote) && (
            <Section title="Check and submit" intro="Make sure everything is correct. Giving false information is an offence.">
              <dl className="divide-y divide-ink/[0.07] rounded-2xl border border-ink/10 text-sm">
                {[
                  ["Amount", formatRand(quote.principal, { cents: false }), 0],
                  ["Repay on", formatDate(quote.dueDate), 0],
                  ["ID number", `•••••••••${f.idNumber.slice(-4)}`, 1],
                  ["Address", `${f.street}, ${f.suburb}, ${f.city}, ${f.postalCode}`, 2],
                  ["Employer", `${f.employer} · ${f.employmentType}`, 3],
                  ["Take-home pay", formatRand(finances.netIncome), 3],
                  ["Expenses & debt", formatRand(afford ? afford.declaredLiving + afford.debtRepayments : 0), 4],
                  ["Bank", `${f.bankName} ••••${f.accountNumber.replace(/\s/g, "").slice(-4)}`, 5],
                  ["Documents", `${files.id.length + files.payslip.length + files.statement.length} files`, 6],
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
              <div className="space-y-3 pt-2">
                {(
                  [
                    ["creditCheck", "I consent to Airdvance verifying my identity, employment, income and bank account, and obtaining my credit report from registered credit bureaus to assess this application."],
                    ["accurate", "The information and documents I've provided are true, complete and my own, and I've declared all my debts and expenses."],
                    ["notUnderDebtReview", "I am not under debt review, sequestration or administration, and have not applied for debt review."],
                    ["ownAccount", "The bank account above is in my own name."],
                    ["privacy", "I have read the privacy policy and agree to my personal information being processed as described."],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="flex items-start gap-3 text-sm text-ink-muted">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-ember" checked={consents[k]} onChange={(e) => setConsents((c) => ({ ...c, [k]: e.target.checked }))} />
                    <span>
                      {label}
                      {k === "privacy" && (
                        <>
                          {" "}
                          <Link href="/privacy" target="_blank" className="text-ember-300 underline">
                            Read it
                          </Link>
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <p className="rounded-xl bg-ink/[0.04] px-4 py-3 text-xs leading-relaxed text-ink-faint">
                Submitting doesn't commit you to a loan and doesn't guarantee approval. If we approve you, you'll see your
                pre-agreement statement and decide whether to sign.
              </p>
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

        {/* Summary */}
        <aside className="glass p-5 lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Your quote</p>
          {isQuoteError(quote) ? (
            <p className="mt-3 text-sm text-rose-300">{quote.error}</p>
          ) : (
            <dl className="mt-3 space-y-2 text-sm">
              <Line k="You receive" v={formatRand(quote.principal)} />
              <Line k="Initiation fee" v={formatRand(quote.initiationFee)} />
              <Line k={`Service fee (${quote.days} days)`} v={formatRand(quote.serviceFee)} />
              <Line k={`Interest (${(quote.monthlyRate * 100).toFixed(0)}% p.m.)`} v={formatRand(quote.interest)} />
              <div className="mt-3 border-t border-ink/10 pt-3">
                <Line k={`Repay on ${formatDate(quote.dueDate, { year: false })}`} v={formatRand(quote.totalRepayable)} strong />
              </div>
              {isRepeat && <p className="pt-2 text-xs text-mint-300">Returning customer rate: 3% per month.</p>}
            </dl>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">Subject to affordability assessment. Final figures appear in your pre-agreement statement.</p>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {intro && <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{intro}</p>}
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

function Select({ value, onChange, options }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }) {
  return (
    <select className="input" value={value} onChange={onChange}>
      <option value="">Choose…</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
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

function Upload({ label, hint, files, onChange, multiple }: { label: string; hint?: string; files: File[]; onChange: (f: File[]) => void; multiple?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 p-4">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
      <label className="btn-ghost btn-sm mt-3 cursor-pointer">
        {files.length ? "Replace files" : "Choose files"}
        <input
          type="file"
          className="sr-only"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
          multiple={multiple}
          onChange={(e) => onChange(Array.from(e.target.files ?? []))}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink-muted">
          {files.map((x) => (
            <li key={x.name + x.size} className="flex justify-between gap-3">
              <span className="truncate">{x.name}</span>
              <span className={x.size > 8 * 1024 * 1024 ? "text-rose-300" : ""}>{(x.size / 1024 / 1024).toFixed(1)} MB</span>
            </li>
          ))}
        </ul>
      )}
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
