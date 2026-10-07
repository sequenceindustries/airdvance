import { z } from "zod";

const money = z.coerce.number().min(0, "Amounts can't be negative.").max(10_000_000);

export const ApplicationSchema = z.object({
  amount: z.coerce.number().int(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your repayment date."),
  personal: z.object({
    idNumber: z.string().trim(),
    maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed", "Living together"]),
    dependants: z.coerce.number().int().min(0).max(20),
    homeLanguage: z.string().trim().max(40).optional().default(""),
  }),
  address: z.object({
    street: z.string().trim().min(3, "Enter your street address."),
    suburb: z.string().trim().min(2, "Enter your suburb."),
    city: z.string().trim().min(2, "Enter your city or town."),
    province: z.string().trim().min(2, "Choose your province."),
    postalCode: z.string().trim().regex(/^\d{4}$/, "Postal codes have 4 digits."),
    residentialStatus: z.enum(["Own", "Rent", "Living with family", "Employer provided"]),
    yearsAtAddress: z.coerce.number().min(0).max(80),
  }),
  employment: z.object({
    employer: z.string().trim().min(2, "Enter your employer's name."),
    employerPhone: z.string().trim().min(9, "Enter your employer's phone number."),
    occupation: z.string().trim().min(2, "Enter your job title."),
    employmentType: z.enum(["Permanent", "Fixed-term contract", "Part-time"]),
    startDate: z.string().regex(/^\d{4}-\d{2}$/, "Enter when you started (month and year)."),
    payFrequency: z.enum(["Monthly", "Fortnightly", "Weekly"]),
  }),
  finances: z.object({
    grossIncome: money.refine((n) => n > 0, "Enter your gross monthly income."),
    netIncome: money.refine((n) => n > 0, "Enter your take-home pay."),
    housing: money,
    food: money,
    transport: money,
    utilities: money,
    education: money,
    otherExpenses: money,
    debtRepayments: money,
  }),
  bank: z.object({
    bankName: z.string().trim().min(2, "Choose your bank."),
    accountHolder: z.string().trim().min(3, "Enter the account holder's name."),
    accountNumber: z.string().trim().regex(/^\d{6,16}$/, "Account numbers have 6 to 16 digits."),
    branchCode: z.string().trim().regex(/^\d{6}$/, "Branch codes have 6 digits."),
    accountType: z.enum(["Cheque / current", "Savings", "Transmission"]),
  }),
  consents: z.object({
    creditCheck: z.literal(true, { errorMap: () => ({ message: "Please consent to the credit check." }) }),
    accurate: z.literal(true, { errorMap: () => ({ message: "Please confirm your information is accurate." }) }),
    notUnderDebtReview: z.literal(true, { errorMap: () => ({ message: "Please confirm you're not under debt review." }) }),
    ownAccount: z.literal(true, { errorMap: () => ({ message: "Please confirm the bank account is in your name." }) }),
    privacy: z.literal(true, { errorMap: () => ({ message: "Please accept the privacy policy." }) }),
  }),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

export const DOC_KINDS = ["ID", "PAYSLIP", "BANK_STATEMENT", "OTHER"] as const;
export const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
