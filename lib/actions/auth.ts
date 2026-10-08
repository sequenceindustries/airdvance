"use server";

import { flashEvent } from "@/lib/analytics-server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { one, query } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { clientIp, createSession, destroySession, getCurrentUser, safeNext } from "@/lib/auth";
import { sendOtp, verifyOtp } from "@/lib/otp";
import { isDemoMessaging, smsEnabled } from "@/lib/messaging";
import { audit } from "@/lib/records";
import { normaliseMobile } from "@/lib/sa";

export type FormState = { error?: string; message?: string; demoCode?: string; fields?: Record<string, string> } | undefined;

const RegisterSchema = z.object({
  full_name: z.string().trim().min(3, "Enter your full name as it appears on your ID.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  mobile: z.string().trim(),
  password: z
    .string()
    .min(10, "Use at least 10 characters for your password.")
    .max(200)
    .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Include letters and at least one number."),
  terms: z.literal("on", { errorMap: () => ({ message: "Please accept the terms and privacy policy to continue." }) }),
  next: z.string().optional(),
});

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  const fields = { full_name: raw.full_name ?? "", email: raw.email ?? "", mobile: raw.mobile ?? "" };
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const mobile = normaliseMobile(parsed.data.mobile);
  if (!mobile) return { error: "Enter a valid South African cellphone number, e.g. 082 123 4567.", fields };

  const existing = await one<{ email: string; mobile: string }>(
    "select email, mobile from users where email = $1 or mobile = $2",
    [parsed.data.email, mobile],
  );
  if (existing) {
    return {
      error: "An account already exists with that email or cellphone number. Log in instead, or reset your password.",
      fields,
    };
  }

  const user = await one<{ id: string }>(
    `insert into users (email, password_hash, full_name, mobile)
     values ($1, $2, $3, $4) returning id`,
    [parsed.data.email, await hashPassword(parsed.data.password), parsed.data.full_name, mobile],
  );
  await audit(null, { actorId: user!.id, action: "USER_REGISTERED", entity: "user", entityId: user!.id, ip: clientIp() });
  await createSession(user!.id);
  flashEvent("sign_up");
  const next = safeNext(parsed.data.next, "/apply");
  if (!smsEnabled()) redirect(next);
  redirect(`/verify?next=${encodeURIComponent(next)}&send=1`);
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fields = { email };
  if (!email || !password) return { error: "Enter your email and password.", fields };

  const recentFailures = await one<{ n: number }>(
    `select count(*)::int n from audit_logs
      where action = 'LOGIN_FAILED' and entity_id = $1 and created_at > now() - interval '15 minutes'`,
    [email],
  );
  if ((recentFailures?.n ?? 0) >= 5) {
    return { error: "Too many attempts. Please wait 15 minutes or reset your password.", fields };
  }

  const user = await one<{ id: string; password_hash: string; role: string; mobile_verified_at: string | null }>(
    "select id, password_hash, role, mobile_verified_at from users where email = $1",
    [email],
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await audit(null, { actorId: user?.id ?? null, action: "LOGIN_FAILED", entity: "login", entityId: email, ip: clientIp() });
    return { error: "That email and password don't match our records.", fields };
  }
  await createSession(user.id);
  await audit(null, { actorId: user.id, action: "LOGIN", entity: "user", entityId: user.id, ip: clientIp() });

  if (user.role === "ADMIN") redirect("/admin");
  flashEvent("login");
  const next = safeNext(form.get("next"), "/dashboard");
  if (smsEnabled() && !user.mobile_verified_at) redirect(`/verify?next=${encodeURIComponent(next)}&send=1`);
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function sendVerificationPin(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in again." };
  if (user.mobile_verified_at) return { message: "Your number is already verified." };
  const res = await sendOtp(user.mobile, "VERIFY_MOBILE", user.id);
  if (!res.ok) return { error: res.error };
  return { message: "We've sent a 6-digit PIN to your cellphone.", demoCode: res.demoCode };
}

export async function confirmVerificationPin(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const code = String(form.get("code") ?? "");
  if (!(await verifyOtp(user.mobile, "VERIFY_MOBILE", code))) {
    return { error: "That PIN is incorrect or has expired. Check it, or request a new one." };
  }
  await query("update users set mobile_verified_at = now(), updated_at = now() where id = $1", [user.id]);
  await audit(null, { actorId: user.id, action: "MOBILE_VERIFIED", entity: "user", entityId: user.id, ip: clientIp() });
  redirect(safeNext(form.get("next"), "/apply"));
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const mobile = normaliseMobile(String(form.get("mobile") ?? ""));
  if (!mobile) return { error: "Enter the South African cellphone number on your account." };
  const user = await one<{ id: string; role: string }>("select id, role from users where mobile = $1", [mobile]);
  // Same response either way, so the form can't be used to discover accounts.
  // Without a real SMS provider, a reset PIN shown on screen would let anyone who
  // knows a number take over that account — so in production it is never shown,
  // and admin accounts can't be reset this way at all.
  let demoCode: string | undefined;
  const demo = isDemoMessaging();
  if (user && !(demo && user.role === "ADMIN")) {
    const res = await sendOtp(mobile, "RESET_PASSWORD", user.id);
    if (!res.ok) return { error: res.error, fields: { mobile: String(form.get("mobile")) } };
    if (process.env.NODE_ENV !== "production") demoCode = res.demoCode;
  }
  return {
    message: "If that number has an Airdvance account, we've sent it a 6-digit PIN.",
    demoCode,
    fields: { mobile: String(form.get("mobile")) },
  };
}

export async function resetPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const mobile = normaliseMobile(String(form.get("mobile") ?? ""));
  const code = String(form.get("code") ?? "");
  const password = String(form.get("password") ?? "");
  const fields = { mobile: String(form.get("mobile") ?? "") };
  if (!mobile) return { error: "Enter your cellphone number.", fields };
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return { error: "Use at least 10 characters, with letters and at least one number.", fields };
  }
  const target = await one<{ role: string }>("select role from users where mobile = $1", [mobile]);
  if (target?.role === "ADMIN" && isDemoMessaging()) return { error: "That PIN is incorrect or has expired.", fields };
  if (!(await verifyOtp(mobile, "RESET_PASSWORD", code))) {
    return { error: "That PIN is incorrect or has expired.", fields };
  }
  const user = await one<{ id: string }>(
    "update users set password_hash = $2, mobile_verified_at = coalesce(mobile_verified_at, now()), updated_at = now() where mobile = $1 returning id",
    [mobile, await hashPassword(password)],
  );
  if (!user) return { error: "That PIN is incorrect or has expired.", fields };
  await query("delete from sessions where user_id = $1", [user.id]);
  await audit(null, { actorId: user.id, action: "PASSWORD_RESET", entity: "user", entityId: user.id, ip: clientIp() });
  await createSession(user.id);
  redirect("/dashboard");
}
