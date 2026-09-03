# Airdvance — Rent-to-Own Smartphones, Tablets & Laptops (MVP)

Get the device you need now. Pay over time. Own it.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth + Row Level Security)
- A provider-agnostic **device-control abstraction layer** (`lib/device-control`) with a mock provider for development, so the full lock/restrict/restore/release lifecycle can be demonstrated before a real MDM/device-financing vendor is integrated.

## 1. Set up Supabase

1. Create a project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`. This creates every table (products, rental_plans, inventory, applications, agreements, payment_schedule, device_control, audit_logs, notifications, device_control_rules) and all Row Level Security policies.
3. Copy `.env.example` to `.env.local` and fill in your project URL, anon key, and service role key from **Project Settings → API**.

## 2. Install & seed

```bash
npm install
npm run seed   # creates demo admin + customer, catalogue, and demo agreements
npm run dev
```

Demo logins (created by the seed script):

- Admin: `admin@airdvance.demo` / `Airdvance!Demo123`
- Customer: `john.doe@airdvance.demo` / `Airdvance!Demo123`

The seeded customer has:
- An **active** agreement (18/24 payments made) on a Samsung Galaxy A25
- A **restricted** device on a defaulted tablet agreement — visible on the customer dashboard and in Admin → Devices
- A **completed/owned** laptop agreement
- A pending application awaiting admin review at Admin → Applications

## 3. Walk through the full lifecycle

1. As the customer, browse `/shop`, open a product, pick a plan, and apply at `/apply`.
2. As admin (`/admin/applications`), open the application and **Approve** it — this creates the agreement, generates the full payment schedule, allocates an available physical device, and registers + activates it through `DeviceControlService`.
3. In `/admin/agreements/[id]`, mark payments as paid one at a time. Once every required payment is recorded, the agreement completes, ownership flips to `OWNED`, and the device is released from device control automatically.
4. In `/admin/devices`, you can manually **Restrict** or **Restore** any allocated device to see the customer-facing restriction banner update on `/dashboard`.
5. `/admin` → **Run overdue payment sweep** simulates the scheduled job: it marks past-due `SCHEDULED` payments as `OVERDUE`, and restricts devices once they've been overdue past the configurable grace period in `device_control_rules`.

## Swapping in a real device-control vendor

Everything in the app calls `DeviceControlService` (`lib/device-control/service.ts`), which in turn calls whichever `DeviceControlProvider` is returned by `resolveProvider()`. To go live:

1. Implement `DeviceControlProvider` (`lib/device-control/provider.ts`) against your chosen vendor's SDK/API in a new file, e.g. `lib/device-control/acme-provider.ts`.
2. Point `resolveProvider()` at it (e.g. behind a `DEVICE_CONTROL_PROVIDER` env var).

No other application code needs to change — agreements, payments, and admin actions only ever talk to `DeviceControlService`.

## Project structure

```
app/                 Routes (public site, apply flow, dashboard, admin)
components/          Shared UI (header, footer, product card, ownership meter, restriction banner)
lib/actions/         Server actions (auth, applications, admin approvals, payments)
lib/data/            Read-side data access (products, customer/agreements)
lib/device-control/  The device-control abstraction layer + mock provider
lib/supabase/        Browser / server / service-role Supabase clients
supabase/migrations/ Full schema + RLS
scripts/seed.ts      Demo data
types/domain.ts      Shared domain types
```

## Explicitly out of scope for this MVP

Native mobile apps, other device categories (TVs, consoles, appliances), AI credit scoring, advanced analytics, multi-country support, loyalty/referral programmes — see the original spec for the full list.
