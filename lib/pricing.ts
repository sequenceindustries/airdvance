import { NCA_CAPS, PRODUCT } from "./config";
import { daysBetween } from "./dates";

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Thousands with commas — deterministic on server and browser (unlike Intl en-ZA). */
export function groupThousands(n: number, decimals = 0): string {
  const neg = n < 0;
  const [int, frac] = Math.abs(n).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${grouped}${frac ? `.${frac}` : ""}`;
}

export function formatRand(n: number, opts: { cents?: boolean } = {}): string {
  const s = groupThousands(n, opts.cents ?? true ? 2 : 0);
  return s.startsWith("-") ? `-R${s.slice(1)}` : `R${s}`;
}

/** Initiation fee per Reg. 42: R165 + 10% above R1,000, never above R1,050. */
export function initiationFee(principal: number): number {
  const base = Math.min(PRODUCT.initiationFeeBase, NCA_CAPS.initiationBase);
  const fee = base + NCA_CAPS.initiationAbove1000Pct * Math.max(0, principal - 1000);
  return round2(Math.min(fee, NCA_CAPS.initiationMax));
}

export function monthlyRate(isRepeatThisYear: boolean): number {
  return isRepeatThisYear
    ? Math.min(PRODUCT.repeatLoanMonthlyRate, NCA_CAPS.repeatLoanMonthlyRate)
    : Math.min(PRODUCT.firstLoanMonthlyRate, NCA_CAPS.firstLoanMonthlyRate);
}

/** Months started, counting any period up to 31 days as one month. */
function monthsStarted(days: number) {
  return Math.max(1, Math.ceil(days / 31));
}

/**
 * Simple interest on the principal, accrued daily at the annualised monthly
 * rate (rate × 12 ÷ 365), never exceeding the monthly cap for the months used.
 */
export function interestFor(principal: number, rate: number, days: number): number {
  if (days <= 0) return 0;
  const accrued = principal * rate * (12 / 365) * days;
  const cap = principal * rate * monthsStarted(days);
  return round2(Math.min(accrued, cap));
}

/** Monthly service fee pro-rated by day, never above R60 per month started. */
export function serviceFeeFor(days: number): number {
  if (days <= 0) return 0;
  const fee = Math.min(PRODUCT.monthlyServiceFee, NCA_CAPS.monthlyServiceFee);
  const accrued = fee * (days / 30);
  return round2(Math.min(accrued, fee * monthsStarted(days)));
}

export interface Quote {
  principal: number;
  startDate: string;
  dueDate: string;
  days: number;
  monthlyRate: number;
  annualRate: number;
  dailyRate: number;
  initiationFee: number;
  serviceFee: number;
  interest: number;
  costOfCredit: number;
  totalRepayable: number;
  costPercent: number;
  isRepeatThisYear: boolean;
}

export type QuoteError = { error: string };

export function validateTerms(principal: number, startDate: string, dueDate: string): string | null {
  if (!Number.isFinite(principal)) return "Choose an amount.";
  if (principal < PRODUCT.minAmount || principal > PRODUCT.maxAmount) {
    return `Choose an amount between R${PRODUCT.minAmount} and ${formatRand(PRODUCT.maxAmount, { cents: false })}.`;
  }
  if (principal % PRODUCT.step !== 0) return `Amounts go up in steps of R${PRODUCT.step}.`;
  const days = daysBetween(startDate, dueDate);
  if (days < PRODUCT.minDays) return `Your repayment date must be at least ${PRODUCT.minDays} days away.`;
  if (days > PRODUCT.maxDays) return `Your repayment date must be within ${PRODUCT.maxDays} days.`;
  return null;
}

export function calculateQuote(input: {
  principal: number;
  startDate: string;
  dueDate: string;
  isRepeatThisYear?: boolean;
  /** Skip min/max-term checks (used when re-pricing at disbursement). */
  allowShortTerm?: boolean;
}): Quote | QuoteError {
  const { principal, startDate, dueDate } = input;
  const repeat = !!input.isRepeatThisYear;
  if (!input.allowShortTerm) {
    const err = validateTerms(principal, startDate, dueDate);
    if (err) return { error: err };
  }
  const days = Math.max(1, daysBetween(startDate, dueDate));
  const rate = monthlyRate(repeat);
  const init = initiationFee(principal);
  const svc = serviceFeeFor(days);
  const interest = interestFor(principal, rate, days);
  const cost = round2(init + svc + interest);
  return {
    principal,
    startDate,
    dueDate,
    days,
    monthlyRate: rate,
    annualRate: round2(rate * 12 * 100) / 100,
    dailyRate: rate * (12 / 365),
    initiationFee: init,
    serviceFee: svc,
    interest,
    costOfCredit: cost,
    totalRepayable: round2(principal + cost),
    costPercent: round2((cost / principal) * 100),
    isRepeatThisYear: repeat,
  };
}

export function isQuoteError(q: Quote | QuoteError): q is QuoteError {
  return "error" in q;
}

export interface Balance {
  asOf: string;
  daysElapsed: number;
  daysLate: number;
  principal: number;
  initiationFee: number;
  serviceFee: number;
  interest: number;
  lateInterest: number;
  totalCharged: number;
  paid: number;
  outstanding: number;
}

/**
 * What the customer owes on a given date. Paying early only costs interest
 * and service fee for the days the money was held (minimum one day). After the
 * due date interest keeps accruing at the agreed daily rate — no penalty rate —
 * and the in duplum rule (s103(5) NCA) caps what accrues during default at the
 * unpaid balance at the time of default.
 */
export function balanceOn(loan: {
  principal: number;
  initiationFee: number;
  monthlyRate: number;
  disbursedOn: string;
  dueDate: string;
  paid: number;
  asOf: string;
}): Balance {
  const { principal, monthlyRate: rate, disbursedOn, dueDate, asOf } = loan;
  const end = daysBetween(asOf, dueDate) >= 0 ? asOf : dueDate;
  const daysElapsed = Math.max(1, daysBetween(disbursedOn, end));
  const interest = interestFor(principal, rate, daysElapsed);
  const serviceFee = serviceFeeFor(daysElapsed);
  const chargedToDue = round2(principal + loan.initiationFee + interest + serviceFee);

  const daysLate = Math.max(0, daysBetween(dueDate, asOf));
  let lateInterest = 0;
  if (daysLate > 0) {
    const balanceAtDefault = Math.max(0, chargedToDue - loan.paid);
    const accrued = principal * rate * (12 / 365) * daysLate;
    lateInterest = round2(Math.min(accrued, balanceAtDefault));
  }
  const totalCharged = round2(chargedToDue + lateInterest);
  return {
    asOf,
    daysElapsed,
    daysLate,
    principal,
    initiationFee: loan.initiationFee,
    serviceFee,
    interest,
    lateInterest,
    totalCharged,
    paid: round2(loan.paid),
    outstanding: round2(Math.max(0, totalCharged - loan.paid)),
  };
}

/** Representative examples shown on the costs page (30-day term, first loan). */
export function representativeExamples(startDate: string, dueDate: string) {
  return [300, 500, 750, 1000].map((p) => calculateQuote({ principal: p, startDate, dueDate, allowShortTerm: true }) as Quote);
}
