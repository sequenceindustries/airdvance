-- Airdvance cash advances — initial schema (Railway Postgres)
create extension if not exists pgcrypto;
create extension if not exists citext;

create table users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  password_hash text not null,
  full_name text not null,
  mobile text not null unique,            -- E.164, +27...
  mobile_verified_at timestamptz,
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index sessions_user_idx on sessions (user_id);

create table otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users (id) on delete cascade,
  mobile text not null,
  purpose text not null check (purpose in ('VERIFY_MOBILE', 'RESET_PASSWORD')),
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);
create index otp_mobile_idx on otp_codes (mobile, purpose, created_at desc);

create table applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid not null references users (id),
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'MORE_INFO_REQUIRED', 'APPROVED', 'DECLINED', 'WITHDRAWN')),
  requested_amount numeric(10,2) not null,
  requested_due_date date not null,
  quote jsonb not null,
  id_number_enc text not null,
  id_number_last4 text not null,
  date_of_birth date not null,
  personal jsonb not null default '{}',     -- title, marital status, dependants, home language
  address jsonb not null default '{}',
  employment jsonb not null default '{}',
  finances jsonb not null default '{}',     -- net income, expenses, existing debt repayments
  bank jsonb not null default '{}',         -- bank, holder, branch, type, last4
  bank_account_enc text not null,
  consents jsonb not null default '{}',
  affordability jsonb not null default '{}',
  decision_reason text,
  info_request text,
  admin_notes jsonb not null default '[]',
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index applications_user_idx on applications (user_id, created_at desc);
create index applications_status_idx on applications (status, submitted_at);

create table documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications (id) on delete cascade,
  user_id uuid not null references users (id),
  kind text not null check (kind in ('ID', 'PAYSLIP', 'BANK_STATEMENT', 'OTHER')),
  filename text not null,
  mime text not null,
  size_bytes int not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index documents_app_idx on documents (application_id);

create table loans (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  application_id uuid not null unique references applications (id),
  user_id uuid not null references users (id),
  status text not null default 'OFFERED'
    check (status in ('OFFERED', 'ACCEPTED', 'ACTIVE', 'ARREARS', 'SETTLED', 'EXPIRED', 'CANCELLED', 'WRITTEN_OFF')),
  principal numeric(10,2) not null,
  initiation_fee numeric(10,2) not null,
  monthly_rate numeric(6,4) not null,
  is_repeat_this_year boolean not null default false,
  due_date date not null,
  offer_quote jsonb not null,               -- quote presented with the offer
  final_quote jsonb,                        -- re-priced at disbursement (never higher)
  offer_expires_at timestamptz not null,
  signed_at timestamptz,
  signature_name text,
  signature_ip text,
  mandate_reference text,
  disbursed_on date,
  payout_reference text,
  amount_paid numeric(10,2) not null default 0,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index loans_user_idx on loans (user_id, created_at desc);
create index loans_status_idx on loans (status, due_date);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans (id),
  type text not null check (type in ('DISBURSEMENT', 'REPAYMENT', 'ADJUSTMENT')),
  amount numeric(10,2) not null,
  method text,
  reference text,
  note text,
  created_by uuid references users (id),
  created_at timestamptz not null default now()
);
create index transactions_loan_idx on transactions (loan_id, created_at);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, created_at desc);

create table audit_logs (
  id bigserial primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}',
  ip text,
  created_at timestamptz not null default now()
);
create index audit_entity_idx on audit_logs (entity, entity_id);
create index audit_action_idx on audit_logs (action, created_at desc);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  mobile text,
  topic text,
  message text not null,
  handled_at timestamptz,
  created_at timestamptz not null default now()
);
