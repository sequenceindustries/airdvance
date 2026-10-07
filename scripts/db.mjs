// Shared helpers for plain-Node scripts (run on Railway before `next start`).
import pg from "pg";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

export function client() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }
  const local = /localhost|127\.0\.0\.1|\.railway\.internal/.test(url) || process.env.DATABASE_SSL === "false";
  return new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: false } });
}

const scryptAsync = promisify(scrypt);
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function normaliseMobile(input) {
  const d = String(input ?? "").replace(/[^\d+]/g, "");
  let local;
  if (d.startsWith("+27")) local = d.slice(3);
  else if (d.startsWith("27") && d.length === 11) local = d.slice(2);
  else if (d.startsWith("0")) local = d.slice(1);
  else return null;
  return /^[6-8]\d{8}$/.test(local) ? `+27${local}` : null;
}
