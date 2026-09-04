"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { submitApplication, type ApplicationDraft } from "@/lib/actions/applications";
import type { Product, RentalPlan, Profile } from "@/types/domain";

const steps = ["Personal information", "Address", "Income & employment", "Device", "Debit order", "Consent"];

export function ApplyWizard({
  product,
  plan,
  profile,
}: {
  product: Product;
  plan: RentalPlan;
  profile: Profile | null;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    id_number: "",
    date_of_birth: "",
    mobile: profile?.mobile ?? "",
    email: profile?.email ?? "",
    residential: "",
    postal: "",
    employment_status: "Employed",
    employer: "",
    monthly_income: "",
    notes: "",
    bank_name: "",
    account_holder: profile?.full_name ?? "",
    account_number: "",
    branch_code: "",
    account_type: "Cheque/Current",
    consent: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const initialCharge = plan.monthly_payment + plan.admin_fee;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const draft: ApplicationDraft = {
      product_id: product.id,
      rental_plan_id: plan.id,
      personal_info: {
        full_name: form.full_name,
        id_number: form.id_number,
        date_of_birth: form.date_of_birth,
        mobile: form.mobile,
        email: form.email,
      },
      address: { residential: form.residential, postal: form.postal || undefined },
      employment: {
        status: form.employment_status,
        employer: form.employer || undefined,
        monthly_income: Number(form.monthly_income) || 0,
        notes: form.notes || undefined,
      },
      debit_order: {
        bank_name: form.bank_name,
        account_holder: form.account_holder,
        account_number: form.account_number,
        branch_code: form.branch_code,
        account_type: form.account_type,
      },
      consent_accepted: form.consent,
    };
    const result = await submitApplication(draft);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
    // On success, submitApplication redirects server-side.
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Apply for your device</h1>

      <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
        {steps.map((label, i) => (
          <li key={label} className={i === step ? "font-medium text-ink" : ""}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-white/10 bg-surface p-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Field label="Full name">
              <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} className="input" required />
            </Field>
            <Field label="ID or passport number">
              <input value={form.id_number} onChange={(e) => update("id_number", e.target.value)} className="input" required />
            </Field>
            <Field label="Date of birth">
              <input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className="input" required />
            </Field>
            <Field label="Mobile number">
              <input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} className="input" required />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="input" required />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <Field label="Residential address">
              <textarea value={form.residential} onChange={(e) => update("residential", e.target.value)} className="input" rows={3} required />
            </Field>
            <Field label="Postal address (if different)">
              <textarea value={form.postal} onChange={(e) => update("postal", e.target.value)} className="input" rows={3} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <Field label="Employment status">
              <select value={form.employment_status} onChange={(e) => update("employment_status", e.target.value)} className="input">
                <option>Employed</option>
                <option>Self-employed</option>
                <option>Contract</option>
                <option>Unemployed</option>
                <option>Student</option>
              </select>
            </Field>
            <Field label="Employer">
              <input value={form.employer} onChange={(e) => update("employer", e.target.value)} className="input" />
            </Field>
            <Field label="Monthly income (before deductions)">
              <input type="number" value={form.monthly_income} onChange={(e) => update("monthly_income", e.target.value)} className="input" required />
            </Field>
            <Field label="Anything else we should know?">
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input" rows={2} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm text-slate-400">Selected device</p>
            <p className="mt-1 font-display text-xl">{product.name}</p>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-sm">
              <span className="text-slate-400">Rental term</span>
              <span>{plan.term_months} months</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-400">Monthly payment</span>
              <span className="font-medium">{formatCurrency(plan.monthly_payment)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-400">Admin fee (charged once, with your first payment)</span>
              <span className="font-medium">{formatCurrency(plan.admin_fee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-400">Own it at the end for</span>
              <span className="font-medium text-brand">{formatCurrency(plan.buyout_amount)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm">
              <span className="text-slate-400">Total payable over the term</span>
              <span>{formatCurrency(plan.total_payable)}</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              We'll set up a debit order for your monthly payments. Today we'll collect your first
              installment ({formatCurrency(plan.monthly_payment)}) plus a once-off admin fee
              ({formatCurrency(plan.admin_fee)}) — <span className="font-medium text-ink">{formatCurrency(initialCharge)} total</span>.
              We'll ship your device as soon as that payment succeeds.
            </p>
            <Field label="Bank">
              <input value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} className="input" placeholder="e.g. FNB, Standard Bank, Capitec" required />
            </Field>
            <Field label="Account holder name">
              <input value={form.account_holder} onChange={(e) => update("account_holder", e.target.value)} className="input" required />
            </Field>
            <Field label="Account number">
              <input value={form.account_number} onChange={(e) => update("account_number", e.target.value)} className="input" inputMode="numeric" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Branch code">
                <input value={form.branch_code} onChange={(e) => update("branch_code", e.target.value)} className="input" inputMode="numeric" required />
              </Field>
              <Field label="Account type">
                <select value={form.account_type} onChange={(e) => update("account_type", e.target.value)} className="input">
                  <option>Cheque/Current</option>
                  <option>Savings</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              By submitting this application, you confirm that the information you've provided is accurate
              and authorize Airdvance to debit the bank account provided for the first payment shown above,
              and thereafter for each monthly installment on your agreement, until the rental term is
              complete or the agreement is otherwise ended. You acknowledge that the device remains the
              property of Airdvance until you complete the final buyout payment.
              <br /><br />
              <span className="font-medium text-alert">
                If a debit order fails, your device will be locked (restricted) until the payment is
                resolved.
              </span>{" "}
              Failed debit orders are not automatically retried — you will need to make a manual payment
              to restore access. (Full legal terms to be inserted.)
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1"
              />
              I have read and accept the declaration and debit order authorization above.
            </label>
            {error && <p className="mt-3 text-sm text-alert">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border border-white/20 px-5 py-2 text-sm font-medium text-slate-300 disabled:opacity-40"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!form.consent || submitting}
            className="rounded-md bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-40"
          >
            {submitting ? `Charging ${formatCurrency(initialCharge)}…` : `Authorize & pay ${formatCurrency(initialCharge)}`}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="block text-slate-300">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
