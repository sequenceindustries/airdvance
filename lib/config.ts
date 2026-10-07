/**
 * Single source of truth for brand, legal and product settings.
 * Everything a compliance officer might need to change lives here and can be
 * overridden with environment variables on Railway without a code change.
 */

function env(name: string, fallback: string) {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : fallback;
}

function num(name: string, fallback: number) {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const BRAND = {
  name: "Airdvance",
  domain: "airdvance.co.za",
  tagline: "Cash for the gap before payday.",
};

/**
 * The registered credit provider that Airdvance trades under. The defaults
 * mirror the group's existing registration and MUST be confirmed before going
 * live — the NCR must know Airdvance as a trading name of this registrant.
 */
export const COMPANY = {
  legalName: env("COMPANY_LEGAL_NAME", "Sequence Industries"),
  tradingAs: "Airdvance",
  ncrcp: env("COMPANY_NCRCP", "NCRCP21330"),
  registrationNumber: env("COMPANY_REG_NUMBER", ""),
  physicalAddress: env("COMPANY_ADDRESS", "Johannesburg, Gauteng, South Africa"),
  email: env("COMPANY_EMAIL", "hello@airdvance.co.za"),
  complaintsEmail: env("COMPANY_COMPLAINTS_EMAIL", "complaints@airdvance.co.za"),
  privacyEmail: env("COMPANY_PRIVACY_EMAIL", "privacy@airdvance.co.za"),
  phone: env("COMPANY_PHONE", ""),
  whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER", ""),
  informationOfficer: env("COMPANY_INFORMATION_OFFICER", "The Information Officer"),
};

/** Bank details customers use for early settlement by EFT. */
export const COLLECTION_ACCOUNT = {
  bank: env("COLLECTION_BANK", ""),
  accountName: env("COLLECTION_ACCOUNT_NAME", ""),
  accountNumber: env("COLLECTION_ACCOUNT_NUMBER", ""),
  branchCode: env("COLLECTION_BRANCH_CODE", ""),
};

/**
 * Product and pricing. NCA short-term credit caps (Reg. 42 & 44):
 *  - interest: max 5% per month on the first loan in a calendar year,
 *    3% per month on subsequent loans in the same calendar year
 *  - initiation fee: max R165 + 10% of the amount above R1,000 (capped at R1,050)
 *  - monthly service fee: max R60
 * Configured values are clamped to these caps in lib/pricing.ts.
 */
export const PRODUCT = {
  minAmount: 300,
  maxAmount: 1000,
  step: 50,
  minDays: 5,
  maxDays: 31,
  firstLoanMonthlyRate: num("RATE_FIRST_LOAN_MONTHLY", 0.05),
  repeatLoanMonthlyRate: num("RATE_REPEAT_LOAN_MONTHLY", 0.03),
  initiationFeeBase: num("INITIATION_FEE_BASE", 165),
  monthlyServiceFee: num("MONTHLY_SERVICE_FEE", 60),
  offerValidDays: 3,
};

export const NCA_CAPS = {
  firstLoanMonthlyRate: 0.05,
  repeatLoanMonthlyRate: 0.03,
  initiationBase: 165,
  initiationAbove1000Pct: 0.1,
  initiationMax: 1050,
  monthlyServiceFee: 60,
};

export const TIMEZONE = "Africa/Johannesburg";
