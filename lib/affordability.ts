import { round2 } from "./pricing";

/**
 * Minimum expense norms from the NCA Affordability Assessment Regulations
 * (Reg. 23A), applied to gross monthly income: fixed factor + % of income above
 * the band floor. Declared living expenses below the norm are replaced by it.
 */
const NORMS = [
  { floor: 0, ceil: 800, fixed: 0, pct: 1 },
  { floor: 800, ceil: 6250, fixed: 900, pct: 0.0675 },
  { floor: 6250, ceil: 25000, fixed: 1167.88, pct: 0.09 },
  { floor: 25000, ceil: 50000, fixed: 2855.38, pct: 0.082 },
  { floor: 50000, ceil: Infinity, fixed: 4905.38, pct: 0.0675 },
];

export function minimumExpenseNorm(grossMonthly: number): number {
  const g = Math.max(0, grossMonthly);
  const band = NORMS.find((b) => g <= b.ceil) ?? NORMS[NORMS.length - 1];
  return round2(band.fixed + band.pct * (g - band.floor));
}

export interface Finances {
  grossIncome: number;
  netIncome: number;
  housing: number;
  food: number;
  transport: number;
  utilities: number;
  education: number;
  otherExpenses: number;
  debtRepayments: number;
}

export interface Affordability {
  declaredLiving: number;
  norm: number;
  livingUsed: number;
  debtRepayments: number;
  disposable: number;
  repayment: number;
  headroomAfterRepayment: number;
  repaymentToNetPct: number;
  passes: boolean;
  flags: string[];
}

export function assessAffordability(f: Finances, repayment: number): Affordability {
  const declaredLiving = round2(f.housing + f.food + f.transport + f.utilities + f.education + f.otherExpenses);
  const norm = minimumExpenseNorm(f.grossIncome);
  const livingUsed = Math.max(declaredLiving, norm);
  const disposable = round2(f.netIncome - livingUsed - f.debtRepayments);
  const headroom = round2(disposable - repayment);
  const flags: string[] = [];
  if (f.netIncome > f.grossIncome) flags.push("Net income is higher than gross income");
  if (declaredLiving < norm) flags.push(`Declared living expenses are below the minimum norm (${norm.toFixed(2)}); norm applied`);
  if (f.netIncome > 0 && f.debtRepayments / f.netIncome > 0.5) flags.push("Existing debt repayments exceed 50% of net income");
  if (headroom < 0) flags.push("Repayment exceeds disposable income");
  const ratio = f.netIncome > 0 ? round2((repayment / f.netIncome) * 100) : 100;
  if (ratio > 30) flags.push(`Repayment is ${ratio}% of net income`);
  return {
    declaredLiving,
    norm,
    livingUsed,
    debtRepayments: f.debtRepayments,
    disposable,
    repayment,
    headroomAfterRepayment: headroom,
    repaymentToNetPct: ratio,
    passes: headroom >= 0 && f.netIncome > 0 && f.netIncome <= f.grossIncome,
    flags,
  };
}
