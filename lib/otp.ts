import "server-only";
import { one, query } from "./db";
import { randomDigits, sha256 } from "./crypto";
import { messaging } from "./messaging";

export type OtpPurpose = "VERIFY_MOBILE" | "RESET_PASSWORD";

const TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
const RESEND_SECONDS = 45;

function hashCode(mobile: string, purpose: string, code: string) {
  return sha256(`${mobile}:${purpose}:${code}`);
}

/**
 * Sends a 6-digit PIN. Returns `demoCode` only when the mock messaging
 * provider is active, so the flow can be tested without an SMS account.
 */
export async function sendOtp(
  mobile: string,
  purpose: OtpPurpose,
  userId: string | null,
): Promise<{ ok: true; demoCode?: string } | { ok: false; error: string }> {
  const recent = await one<{ n: number; last: string | null }>(
    `select count(*)::int as n, max(created_at) as last from otp_codes
      where mobile = $1 and purpose = $2 and created_at > now() - interval '1 hour'`,
    [mobile, purpose],
  );
  if (recent && recent.n >= MAX_SENDS_PER_HOUR) {
    return { ok: false, error: "Too many PINs requested. Please try again in an hour." };
  }
  if (recent?.last && Date.now() - new Date(recent.last).getTime() < RESEND_SECONDS * 1000) {
    return { ok: false, error: `Please wait ${RESEND_SECONDS} seconds before requesting another PIN.` };
  }

  const code = randomDigits(6);
  await query(
    `insert into otp_codes (user_id, mobile, purpose, code_hash, expires_at)
     values ($1, $2, $3, $4, now() + interval '${TTL_MINUTES} minutes')`,
    [userId, mobile, purpose, hashCode(mobile, purpose, code)],
  );
  const provider = messaging();
  const sent = await provider.send(
    mobile,
    `Your Airdvance PIN is ${code}. It expires in ${TTL_MINUTES} minutes. Airdvance will never ask you for this PIN.`,
  );
  if (!sent.ok) return { ok: false, error: "We couldn't send your PIN. Please try again shortly." };
  return provider.name === "mock" ? { ok: true, demoCode: code } : { ok: true };
}

export async function verifyOtp(mobile: string, purpose: OtpPurpose, code: string): Promise<boolean> {
  const row = await one<{ id: string; code_hash: string; attempts: number }>(
    `select id, code_hash, attempts from otp_codes
      where mobile = $1 and purpose = $2 and consumed_at is null and expires_at > now()
      order by created_at desc limit 1`,
    [mobile, purpose],
  );
  if (!row || row.attempts >= MAX_ATTEMPTS) return false;
  if (row.code_hash !== hashCode(mobile, purpose, code.replace(/\D/g, ""))) {
    await query("update otp_codes set attempts = attempts + 1 where id = $1", [row.id]);
    return false;
  }
  await query("update otp_codes set consumed_at = now() where id = $1", [row.id]);
  return true;
}
