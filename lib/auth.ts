import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { one, query } from "./db";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "ad_session";
const SESSION_DAYS = 14;

export interface User {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  mobile_verified_at: string | null;
  role: "CUSTOMER" | "ADMIN";
  created_at: string;
}

export function clientIp(): string {
  const h = headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "").trim();
}

export async function createSession(userId: string) {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query(
    "insert into sessions (user_id, token_hash, expires_at, ip, user_agent) values ($1, $2, $3, $4, $5)",
    [userId, sha256(token), expires, clientIp(), headers().get("user-agent")?.slice(0, 300) ?? null],
  );
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await query("delete from sessions where token_hash = $1", [sha256(token)]);
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return one<User>(
    `select u.id, u.email, u.full_name, u.mobile, u.mobile_verified_at, u.role, u.created_at
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`,
    [sha256(token)],
  );
}

export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

/** Customers must verify their mobile number before applying or borrowing. */
export async function requireVerifiedUser(next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!user.mobile_verified_at) redirect(`/verify${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export function safeNext(next: unknown, fallback: string): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
