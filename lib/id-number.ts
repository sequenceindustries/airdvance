/**
 * South African ID numbers encode date of birth in the first 6 digits (YYMMDD).
 * There's no century digit, so we use the standard heuristic: if the two-digit
 * year is less than or equal to the current two-digit year, assume 2000s,
 * otherwise 1900s. This is imperfect for centenarians but correct for the
 * overwhelming majority of applicants.
 */
export function deriveDateOfBirthFromSaId(idNumber: string): string | null {
  const digits = idNumber.replace(/\D/g, "");
  if (digits.length < 6) return null;

  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);

  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const currentYY = new Date().getFullYear() % 100;
  const year = (yy <= currentYY ? 2000 : 1900) + yy;

  // Validate the day actually exists in that month/year (e.g. rejects Feb 30).
  const date = new Date(year, mm - 1, dd);
  if (date.getFullYear() !== year || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    return null;
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(mm)}-${pad(dd)}`;
}
