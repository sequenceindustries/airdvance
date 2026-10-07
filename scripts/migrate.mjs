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

  // One-time admin bootstrap from a password HASH (never a plain password).
  const { ADMIN_BOOTSTRAP_EMAIL: bEmail, ADMIN_BOOTSTRAP_PASSWORD_HASH: bHash } = process.env;
  if (bEmail && bHash?.startsWith("scrypt$")) {
    const res = await db.query(
      `insert into users (email, password_hash, full_name, mobile, mobile_verified_at, role)
       values ($1, $2, $3, $4, now(), 'ADMIN') on conflict do nothing returning email`,
      [bEmail, bHash, process.env.ADMIN_BOOTSTRAP_NAME || "Airdvance Admin", process.env.ADMIN_BOOTSTRAP_MOBILE || "+27600000000"],
    );
    if (res.rowCount) {
      console.log(`[admin] created ${res.rows[0].email}`);
    } else {
      // Account already exists (e.g. registered as a customer): promote it and set the
      // bootstrap password, ending any existing sessions. Runs once — skipped when the
      // stored hash already matches.
      const up = await db.query(
        `update users set role = 'ADMIN', password_hash = $2, mobile_verified_at = coalesce(mobile_verified_at, now()), updated_at = now()
          where email = $1 and password_hash <> $2 returning id`,
        [bEmail, bHash],
      );
      if (up.rowCount) {
        await db.query("delete from sessions where user_id = $1", [up.rows[0].id]);
        console.log(`[admin] promoted existing account ${bEmail} and reset its password`);
      } else {
        console.log("[admin] bootstrap already applied");
      }
    }
  }
} finally {
  await db.query("select pg_advisory_unlock(424242)").catch(() => {});
  await db.end();
}
