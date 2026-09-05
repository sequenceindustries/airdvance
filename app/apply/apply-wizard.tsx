"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/pricing";
import { submitApplication, type ApplicationDraft } from "@/lib/actions/applications";
import { fetchProductWithPlans } from "@/lib/actions/apply-lookup";
import { SOUTH_AFRICAN_BANKS } from "@/lib/data/banks";
import { deriveDateOfBirthFromSaId } from "@/lib/id-number";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import type { Product, RentalPlan, Profile, DeviceCategory } from "@/types/domain";

const steps = ["Personal information", "Address", "Income & employment", "Device", "Debit order", "Consent"];

type ProductOption = Pick<Product, "id" | "name" | "brand" | "category" | "slug">;

const categoryLabels: Record<DeviceCategory, string> = {
  SMARTPHONE: "Smartphones",
  TABLET: "Tablets",
  LAPTOP: "Laptops",
};

export function ApplyWizard({
  product,
  plan,
  plans,
  allProducts,
  profile,
}: {
  product: Product;
  plan: RentalPlan;
  plans: RentalPlan[];
  allProducts: ProductOption[];
  profile: Profile | null;
}) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The device and plan the customer is actually applying for -- kept as
  // client state so switching either one is instant and never loses any of
  // the personal/address/employment/debit-order details already filled in.
  const [currentProduct, setCurrentProduct] = useState(product);
  const [availablePlans, setAvailablePlans] = useState(plans.length ? plans : [plan]);
  const [currentPlanId, setCurrentPlanId] = useState(plan?.id);
  const [switchingDevice, setSwitchingDevice] = useState(false);
  const currentPlan = availablePlans.find((p) => p.id === currentPlanId) ?? availablePlans[0];

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
    bank_name: "",
    account_holder: profile?.full_name ?? "",
    account_number: "",
    branch_code: "",
    account_type: "Cheque/Current",
    next_payday: "",
    consent: false,
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateIdNumber(value: string) {
    const derivedDob = deriveDateOfBirthFromSaId(value);
    setForm((f) => ({ ...f, id_number: value, date_of_birth: derivedDob ?? f.date_of_birth }));
  }

  function selectBank(bankName: string) {
    const bank = SOUTH_AFRICAN_BANKS.find((b) => b.name === bankName);
    setForm((f) => ({ ...f, bank_name: bankName, branch_code: bank?.branchCode ?? f.branch_code }));
  }

  async function selectDevice(productId: string) {
    if (productId === currentProduct.id) return;
    setSwitchingDevice(true);
    const result = await fetchProductWithPlans(productId);
    setSwitchingDevice(false);
    if (!result) return;
    setCurrentProduct(result.product);
    setAvailablePlans(result.plans);
    setCurrentPlanId(result.plans[0]?.id);
  }

  const initialCharge = currentPlan.monthly_payment + currentPlan.admin_fee;
  const minPayday = new Date().toISOString().slice(0, 10);

  const productsByCategory = allProducts.reduce<Record<string, ProductOption[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const draft: ApplicationDraft = {
      product_id: currentProduct.id,
      rental_plan_id: currentPlan.id,
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
      },
      debit_order: {
        bank_name: form.bank_name,
        account_holder: form.account_holder,
        account_number: form.account_number,
        branch_code: form.branch_code,
        account_type: form.account_type,
      },
      next_payday: form.next_payday,
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
      <p className="mt-2 text-sm text-slate-400">
        This is rent-to-buy, not credit — there's no credit check. We just need to confirm your
        employment and that the monthly payment is affordable for you.
      </p>

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
              <input value={form.id_number} onChange={(e) => updateIdNumber(e.target.value)} className="input" required />
            </Field>
            <Field label="Date of birth">
              <input type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} className="input" required />
              <span className="mt-1 block text-xs text-slate-500">Auto-filled from your ID number — you can adjust it if needed.</span>
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
              <AddressAutocomplete value={form.residential} onChange={(v) => update("residential", v)} required />
            </Field>
            <Field label="Delivery address (if different)">
              <AddressAutocomplete value={form.postal} onChange={(v) => update("postal", v)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-400">
              No credit score is required for rent-to-buy — we just check that this is affordable
              alongside your other commitments.
            </p>
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
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <Field label="Device">
              <select
                value={currentProduct.id}
                onChange={(e) => selectDevice(e.target.value)}
                className="input"
                disabled={switchingDevice}
              >
                {Object.entries(productsByCategory).map(([category, items]) => (
                  <optgroup key={category} label={categoryLabels[category as DeviceCategory] ?? category}>
                    {items.map((p) => (
                      <option key={p.id} value={p.id}>{p.brand} {p.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {switchingDevice && <span className="mt-1 block text-xs text-slate-500">Loading plans…</span>}
            </Field>

            <Field label="Rental term">
              <select
                value={currentPlan?.id}
                onChange={(e) => setCurrentPlanId(e.target.value)}
                className="input"
                disabled={switchingDevice || availablePlans.length === 0}
              >
                {availablePlans.map((p) => (
                  <option key={p.id} value={p.id}>{p.term_months} months — {formatCurrency(p.monthly_payment)}/month</option>
                ))}
              </select>
            </Field>

            {currentPlan && (
              <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly payment</span>
                  <span className="font-medium">{formatCurrency(currentPlan.monthly_payment)}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-slate-400">Admin fee (charged once, with your first payment)</span>
                  <span className="font-medium">{formatCurrency(currentPlan.admin_fee)}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-slate-400">Buy it at the end for</span>
                  <span className="font-medium text-brand">{formatCurrency(currentPlan.buyout_amount)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-white/10 pt-2">
                  <span className="text-slate-400">Total payable over the term</span>
                  <span>{formatCurrency(currentPlan.total_payable)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && currentPlan && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              This is rent-to-buy, not credit — we won't charge you today. We'll authorize a debit
              order now, then collect your first payment ({formatCurrency(currentPlan.monthly_payment)} +{" "}
              {formatCurrency(currentPlan.admin_fee)} admin fee ={" "}
              <span className="font-medium text-ink">{formatCurrency(initialCharge)}</span>) on your
              next payday. As soon as that payment clears, we'll deliver your device within 7 days.
            </p>
            <Field label="Bank">
              <select value={form.bank_name} onChange={(e) => selectBank(e.target.value)} className="input" required>
                <option value="" disabled>Select your bank</option>
                {SOUTH_AFRICAN_BANKS.map((bank) => (
                  <option key={bank.name} value={bank.name}>{bank.name}</option>
                ))}
              </select>
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
            <Field label="Your next payday">
              <input type="date" min={minPayday} value={form.next_payday} onChange={(e) => update("next_payday", e.target.value)} className="input" required />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              This is a rent-to-buy agreement, not a credit agreement — by submitting this application
              you confirm that the information you've provided is accurate, and authorize airdvance to
              debit the bank account provided on the payday given above for your first payment, and
              thereafter monthly for each installment on your agreement, until the rental term is
              complete or the agreement is otherwise ended. You acknowledge that the device remains the
              property of airdvance until you complete the final buyout payment.
              <br /><br />
              <span className="font-medium text-alert">
                If a debit order fails, your device will be locked until the payment is resolved.
              </span>{" "}
              Failed debit orders are not automatically retried — you will need to make a manual payment
              to unlock your device. See our{" "}
              <Link href="/terms" target="_blank" className="text-accent underline">Terms & Conditions</Link>.
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
            {submitting ? "Applying…" : "Apply"}
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
