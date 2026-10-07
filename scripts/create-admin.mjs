// Creates or promotes an admin account.
// Usage: ADMIN_EMAIL=you@x.co.za ADMIN_PASSWORD='...' ADMIN_MOBILE=0821234567 ADMIN_NAME='Jane Doe' npm run create-admin
import { client, hashPassword, normaliseMobile } from "./db.mjs";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const mobile = normaliseMobile(process.env.ADMIN_MOBILE ?? "");
const name = process.env.ADMIN_NAME ?? "Airdvance Admin";

if (!email || !password || password.length < 10 || !mobile) {
  console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD (10+ chars) and a valid SA ADMIN_MOBILE.");
  process.exit(1);
}

const db = client();
await db.connect();
const hash = await hashPassword(password);
const { rows } = await db.query(
  `insert into users (email, password_hash, full_name, mobile, mobile_verified_at, role)
   values ($1, $2, $3, $4, now(), 'ADMIN')
   on conflict (email) do update set role = 'ADMIN', password_hash = excluded.password_hash, updated_at = now()
   returning id, email`,
  [email, hash, name, mobile],
);
console.log(`Admin ready: ${rows[0].email}`);
await db.end();
