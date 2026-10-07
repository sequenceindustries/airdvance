import "server-only";
import type { PoolClient } from "pg";
import { query } from "./db";
import { randomInt } from "crypto";

type Runner = Pick<PoolClient, "query"> | null;

async function run(c: Runner, sql: string, params: unknown[]) {
  if (c) await c.query(sql, params as any[]);
  else await query(sql, params);
}

export function audit(
  c: Runner,
  e: { actorId: string | null; action: string; entity: string; entityId?: string; metadata?: object; ip?: string },
) {
  return run(c, "insert into audit_logs (actor_id, action, entity, entity_id, metadata, ip) values ($1,$2,$3,$4,$5,$6)", [
    e.actorId,
    e.action,
    e.entity,
    e.entityId ?? null,
    JSON.stringify(e.metadata ?? {}),
    e.ip ?? null,
  ]);
}

export function notify(c: Runner, userId: string, title: string, body: string, href?: string) {
  return run(c, "insert into notifications (user_id, title, body, href) values ($1,$2,$3,$4)", [
    userId,
    title,
    body,
    href ?? null,
  ]);
}

/** Human-friendly references without ambiguous characters, e.g. AD-7KQ4M2. */
export function makeReference(prefix: string) {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[randomInt(0, alphabet.length)];
  return `${prefix}-${s}`;
}
