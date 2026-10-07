import "server-only";
import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

// Return DATE columns as plain "YYYY-MM-DD" strings, never timezone-shifted Dates.
types.setTypeParser(1082, (v: string) => v);

declare global {
  // eslint-disable-next-line no-var
  var __airdvancePool: Pool | undefined;
}

function sslFor(url: string) {
  // Railway's private network (*.railway.internal) and local databases don't
  // use TLS; public proxies do.
  if (/localhost|127\.0\.0\.1|\.railway\.internal/.test(url)) return undefined;
  if (process.env.DATABASE_SSL === "false") return undefined;
  return { rejectUnauthorized: false };
}

export function pool(): Pool {
  if (!global.__airdvancePool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    global.__airdvancePool = new Pool({ connectionString: url, ssl: sslFor(url), max: 10 });
  }
  return global.__airdvancePool;
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query<T>(text, params as any[]);
  return res.rows;
}

export async function one<T extends QueryResultRow = any>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    const out = await fn(client);
    await client.query("commit");
    return out;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
