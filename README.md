# Airdvance — online cash advances (R300–R1,000)

Short-term credit for South African salaried customers, repaid in one DebiCheck debit order on payday.
Next.js 14 (App Router) + TypeScript + Tailwind, Postgres on Railway, no external auth provider.

> The previous rent-to-own device version is preserved at git tag `archive/rent-to-own`.

## What's in it

**Public site** — home with live cost calculator, How it works, Costs & repayment (representative examples),
Who can apply, FAQ, Contact, Responsible lending, Complaints, Terms, Privacy (POPIA), PAIA manual.

**Customer journey**
1. Register (email + password) → confirm cellphone with a 6-digit PIN
2. 8-step application: amount & payday → SA ID (Luhn + age check) → address → employment & income →
   expenses (live affordability estimate) → bank (auto branch codes) → documents → declarations
3. Status page; respond to "more information" requests with extra uploads
4. Offer: pre-agreement statement & quotation → sign by typing full name → DebiCheck mandate
5. Active loan: settlement amount today, EFT details, transactions; printable signed agreement

**Admin** (`/admin`) — queue & KPIs, application review (affordability incl. NCR minimum expense norms,
documents, logged reveal of encrypted ID/account numbers, notes), approve (optionally a lower amount),
decline with reason & bureau, request info, pay out (re-priced from payout date — never higher than signed),
DebiCheck collection, record EFT payments, cancel before payout, contact inbox, audit trail.
Offers expire after 3 days; loans move to arrears after the due date (run on admin page load).

## Pricing (lib/pricing.ts — unit tested)

Within NCA short-term credit caps, clamped in code even if env overrides are set:
- Initiation fee R165 (R165 + 10% above R1,000, max R1,050)
- Service fee R60/month, pro-rated by day, never above R60 per month started
- Interest 5% per month (first loan in calendar year) / 3% (later loans that year), simple, daily accrual
- Early settlement: initiation fee + fees/interest for days used (min 1 day), no penalty
- Default: same rate continues; accrual during default capped by in duplum (s103(5))

R1,000 for 30 days → R1,274.32.

## Run locally

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL and DATA_ENCRYPTION_KEY (openssl rand -base64 32)
export DATABASE_URL=...      # scripts don't read .env.local
npm run migrate
ADMIN_EMAIL=you@example.co.za ADMIN_PASSWORD='long-password-1' ADMIN_MOBILE=0821234567 ADMIN_NAME='Your Name' npm run create-admin
npm run dev
npm test                     # pricing, affordability, SA ID, mobile tests
```

## Deploy on Railway

- Add a **Postgres** service; on the web service set `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Set `DATA_ENCRYPTION_KEY` (never change it after real data exists), `APP_URL`, and the `COMPANY_*` / `COLLECTION_*` variables
- `npm start` runs migrations then starts Next.js; health check at `/api/health` (see `railway.json`)
- Run `npm run create-admin` once (Railway shell or `railway run`)

## Before taking real customers

Integration seams are in place but run in **demo mode** (a site-wide banner says so):
- `lib/payments.ts` — implement a real provider for DebiCheck mandates, payouts and collections
- `lib/messaging.ts` — set `MESSAGING_PROVIDER=twilio` + credentials (or add another SMS/WhatsApp provider)
- Credit bureau checks and bank account verification (AVS) are manual today — admins confirm them before approving
- Have the legal pages, agreement wording and NCR trading-name registration reviewed by your compliance adviser
