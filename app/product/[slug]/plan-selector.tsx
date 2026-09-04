"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { formatCurrency } from "@/lib/pricing";
import type { Product, RentalPlan } from "@/types/domain";

export function PlanSelector({ product, plans }: { product: Product; plans: RentalPlan[] }) {
  const [selectedId, setSelectedId] = useState(plans[0]?.id);
  const selected = plans.find((p) => p.id === selectedId) ?? plans[0];

  if (!selected) {
    return <p className="mt-6 text-slate-400">No rental plans are currently available for this device.</p>;
  }

  return (
    <div className="mt-6">
      <div className="rounded-lg border border-white/10 bg-surface p-5">
        <p className="text-3xl font-semibold text-ink">
          {formatCurrency(selected.monthly_payment)}
          <span className="text-base font-normal text-slate-400"> / month</span>
        </p>
        <p className="mt-1 text-sm text-slate-400">{selected.term_months} month plan</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedId(plan.id)}
              className={clsx(
                "rounded-md border px-4 py-2 text-sm font-medium transition focus-ring",
                plan.id === selected.id
                  ? "border-accent bg-accent-light text-accent-dark"
                  : "border-white/10 text-slate-300 hover:border-white/30",
              )}
            >
              {plan.term_months} months
            </button>
          ))}
        </div>

        <dl className="mt-5 space-y-1 text-sm text-slate-300">
          {selected.deposit > 0 ? (
            <div className="flex justify-between">
              <dt>Deposit</dt>
              <dd>{formatCurrency(selected.deposit)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt>Total payable</dt>
            <dd>{formatCurrency(selected.total_payable)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Cash price</dt>
            <dd>{formatCurrency(product.cash_price)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-slate-400">
          After completing the required payments, the device becomes yours.
        </p>

        <Link
          href={`/apply?product=${product.slug}&plan=${selected.id}`}
          className="mt-5 block w-full rounded-md bg-brand py-3 text-center font-medium text-white hover:bg-brand-dark focus-ring"
        >
          Apply now
        </Link>
      </div>
    </div>
  );
}
