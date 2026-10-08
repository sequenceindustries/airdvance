import { z } from "zod";

const money = z.coerce.number().min(0, "Amounts can't be negative.").max(10_000_000);

/**
 * Only what we need to verify the applicant, assess affordability (NCA s81 and
 * Reg. 23A: gross and net income, living expenses, existing debt) and pay out to,
 * and collect from, their own account.
 */
export const ApplicationSchema = z.object({
  amount: z.coerce.number().int(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your repayment date."),
  idNumber: z.string().trim(),
  address: z.string().trim().min(8, "Enter your home address."),
  employer: z.string().trim().min(2, "Enter your employer's name."),
  finances: z.object({
    grossIncome: money.refine((n) => n > 0, "Enter your salary before deductions."),
    netIncome: money.refine((n) => n > 0, "Enter the salary paid into your account."),
    livingExpenses: money,
    debtRepayments: money,
  }),
  bank: z.object({
    bankName: z.string().trim().min(2, "Choose your bank."),
    accountNumber: z.string().trim().regex(/^\d{6,16}$/, "Account numbers have 6 to 16 digits."),
    accountType: z.enum(["Cheque / current", "Savings"]),
  }),
  consents: z.object({
    creditCheck: z.literal(true, { errorMap: () => ({ message: "Please agree to the credit check." }) }),
    declaration: z.literal(true, { errorMap: () => ({ message: "Please confirm the declaration." }) }),
  }),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

export const DOC_KINDS = ["ID", "PAYSLIP", "BANK_STATEMENT", "OTHER"] as const;
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
