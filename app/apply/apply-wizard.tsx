"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { submitApplication, type ApplicationDraft } from "@/lib/actions/applications";
import type { Product, RentalPlan, Profile } from "@/types/domain";

const steps = ["Personal information", "Address", "Income & employment", "Device", "Documents", "Consent"];

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
  const [documentNames, setDocumentNames] = useState<string[]>([]);

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
    consent: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

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

      <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        {steps.map((label, i) => (
          <li key={label} className={i === step ? "font-medium text-ink" : ""}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
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
            <p className="text-sm text-slate-500">Selected device</p>
            <p className="mt-1 font-display text-xl">{product.name}</p>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">Rental term</span>
              <span>{plan.term_months} months</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Monthly payment</span>
              <span className="font-medium">{formatCurrency(plan.monthly_payment)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-slate-500">Total payable</span>
              <span>{formatCurrency(plan.total_payable)}</span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-sm text-slate-600">
              Upload proof of identity and proof of income. (In this MVP, file names are recorded — actual
              document storage connects to Supabase Storage.)
            </p>
            <input
              type="file"
              multiple
              className="mt-4 text-sm"
              onChange={(e) => setDocumentNames(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
            {documentNames.length > 0 && (
              <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
                {documentNames.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              By submitting this application, you confirm that the information you've provided is accurate
              and consent to Airdvance verifying it for the purpose of assessing this rent-to-own
              application. You acknowledge that the device remains the property of Airdvance until all
              qualifying payments under your agreement have been completed, and that Airdvance may restrict
              access to the device if a payment becomes overdue, subject to the terms of your agreement.
              (Full legal terms to be inserted.)
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1"
              />
              I have read and accept the declaration above.
            </label>
            {error && <p className="mt-3 text-sm text-alert">{error}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
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
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="block text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
