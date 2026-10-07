// Applies db/migrations/*.sql in order, once each. Safe to run on every boot.
import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { client } from "./db.mjs";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const db = client();
await db.connect();
try {
  await db.query("select pg_advisory_lock(424242)");
  await db.query(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const done = new Set((await db.query("select name from schema_migrations")).rows.map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    if (done.has(f)) continue;
    console.log(`[migrate] applying ${f}`);
    await db.query("begin");
    try {
      await db.query(readFileSync(join(dir, f), "utf8"));
      await db.query("insert into schema_migrations (name) values ($1)", [f]);
      await db.query("commit");
    } catch (e) {
      await db.query("rollback");
      throw e;
    }
  }
  console.log("[migrate] up to date");
} finally {
  await db.query("select pg_advisory_unlock(424242)").catch(() => {});
  await db.end();
}
