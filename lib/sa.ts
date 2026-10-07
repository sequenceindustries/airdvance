/** South African identity, phone and bank helpers (shared by client and server). */

export interface SaIdInfo {
  valid: boolean;
  error?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: "female" | "male";
  citizen?: boolean;
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Validates a 13-digit SA ID number: YYMMDD SSSS C A Z.
 * Century is inferred (<= current 2-digit year → 2000s).
 */
export function parseSaId(idNumber: string, today: Date = new Date()): SaIdInfo {
  const digits = (idNumber ?? "").replace(/\D/g, "");
  if (digits.length !== 13) return { valid: false, error: "An SA ID number has 13 digits." };
  if (!luhnValid(digits)) return { valid: false, error: "That ID number doesn't look right — please check it." };

  const yy = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const dd = Number(digits.slice(4, 6));
  const year = (yy <= today.getFullYear() % 100 ? 2000 : 1900) + yy;
  const dob = new Date(Date.UTC(year, mm - 1, dd));
  if (dob.getUTCFullYear() !== year || dob.getUTCMonth() !== mm - 1 || dob.getUTCDate() !== dd) {
    return { valid: false, error: "The date of birth in that ID number isn't valid." };
  }
  let age = today.getFullYear() - year;
  const beforeBirthday =
    today.getMonth() + 1 < mm || (today.getMonth() + 1 === mm && today.getDate() < dd);
  if (beforeBirthday) age -= 1;

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    valid: true,
    dateOfBirth: `${year}-${pad(mm)}-${pad(dd)}`,
    age,
    gender: Number(digits.slice(6, 10)) >= 5000 ? "male" : "female",
    citizen: digits[10] === "0",
  };
}

/** Normalise SA mobile numbers to +27XXXXXXXXX, or null if invalid. */
export function normaliseMobile(input: string): string | null {
  const d = (input ?? "").replace(/[^\d+]/g, "");
  let local: string;
  if (d.startsWith("+27")) local = d.slice(3);
  else if (d.startsWith("27") && d.length === 11) local = d.slice(2);
  else if (d.startsWith("0")) local = d.slice(1);
  else return null;
  if (!/^[6-8]\d{8}$/.test(local)) return null;
  return `+27${local}`;
}

export function displayMobile(e164: string): string {
  if (!e164?.startsWith("+27")) return e164 ?? "";
  const l = e164.slice(3);
  return `0${l.slice(0, 2)} ${l.slice(2, 5)} ${l.slice(5)}`;
}

/** Major SA banks and their universal branch codes. */
export const SA_BANKS: { name: string; branchCode: string }[] = [
  { name: "ABSA Bank", branchCode: "632005" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Bank Zero", branchCode: "888000" },
  { name: "Bidvest Bank", branchCode: "462005" },
  { name: "Capitec Bank", branchCode: "470010" },
  { name: "Discovery Bank", branchCode: "679000" },
  { name: "First National Bank (FNB)", branchCode: "250655" },
  { name: "Investec Bank", branchCode: "580105" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "TymeBank", branchCode: "678910" },
];

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];
