import type { RentalPlan } from "@/types/domain";

/**
 * All pricing/plan math lives here so it is never duplicated or
 * hard-coded inside a frontend component (spec §9).
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function totalPayable(plan: Pick<RentalPlan, "monthly_payment" | "term_months" | "deposit" | "admin_fee">): number {
  return plan.deposit + plan.admin_fee + plan.monthly_payment * plan.term_months;
}

export function cheapestPlan(plans: RentalPlan[]): RentalPlan | undefined {
  return [...plans].sort((a, b) => a.monthly_payment - b.monthly_payment)[0];
}

export function ownershipProgress(paymentsCompleted: number, paymentsRequired: number) {
  const percent = paymentsRequired === 0 ? 0 : Math.min(100, Math.round((paymentsCompleted / paymentsRequired) * 100));
  return {
    percent,
    remainingPayments: Math.max(0, paymentsRequired - paymentsCompleted),
  };
}
