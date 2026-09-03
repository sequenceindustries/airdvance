-- Airdvance MVP schema
-- Run against a Supabase Postgres project. Assumes auth.users already exists.

create extension if not exists "pgcrypto";

-- ========== PROFILES ==========
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  mobile text,
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
  created_at timestamptz not null default now()
);

-- ========== PRODUCTS ==========
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  brand text not null,
  category text not null check (category in ('SMARTPHONE', 'TABLET', 'LAPTOP')),
  description text not null default '',
  specifications jsonb not null default '{}',
  cash_price numeric(10, 2) not null,
  images text[] not null default '{}',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== RENTAL PLANS ==========
create table rental_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  term_months int not null,
  monthly_payment numeric(10, 2) not null,
  deposit numeric(10, 2) not null default 0,
  total_payable numeric(10, 2) not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE'))
);

-- ========== INVENTORY (PHYSICAL DEVICES) ==========
create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id),
  asset_number text not null unique,
  serial_number text,
  imei text,
  condition text not null default 'NEW',
  status text not null default 'AVAILABLE'
    check (status in ('AVAILABLE', 'RESERVED', 'ALLOCATED', 'ACTIVE', 'RETURNED', 'DAMAGED', 'LOST', 'OWNED')),
  location text,
  agreement_id uuid,
  customer_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent the same physical device being active on more than one agreement.
create unique index inventory_one_active_agreement
  on inventory (id)
  where status in ('ALLOCATED', 'ACTIVE');

-- ========== APPLICATIONS ==========
create table applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id),
  product_id uuid not null references products (id),
  rental_plan_id uuid not null references rental_plans (id),
  status text not null default 'DRAFT'
    check (status in ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED', 'APPROVED', 'DECLINED', 'CANCELLED')),
  personal_info jsonb not null default '{}',
  address jsonb not null default '{}',
  employment jsonb not null default '{}',
  documents jsonb not null default '[]',
  consent_accepted boolean not null default false,
  internal_notes jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  decided_at timestamptz
);

-- ========== AGREEMENTS ==========
create table agreements (
  id uuid primary key default gen_random_uuid(),
  agreement_number text not null unique,
  customer_id uuid not null references profiles (id),
  product_id uuid not null references products (id),
  device_id uuid not null references inventory (id),
  rental_plan_id uuid not null references rental_plans (id),
  start_date date not null,
  end_date date not null,
  term_months int not null,
  monthly_payment numeric(10, 2) not null,
  deposit numeric(10, 2) not null default 0,
  total_payable numeric(10, 2) not null,
  payments_required int not null,
  payments_completed int not null default 0,
  amount_paid numeric(10, 2) not null default 0,
  amount_remaining numeric(10, 2) not null,
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACTIVE', 'PAUSED', 'DEFAULTED', 'COMPLETED', 'CANCELLED')),
  ownership_status text not null default 'NOT_OWNED'
    check (ownership_status in ('NOT_OWNED', 'OWNERSHIP_PENDING', 'OWNED')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table inventory
  add constraint inventory_agreement_fk foreign key (agreement_id) references agreements (id);

-- ========== PAYMENT SCHEDULE ==========
create table payment_schedule (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references agreements (id) on delete cascade,
  customer_id uuid not null references profiles (id),
  payment_number int not null,
  amount numeric(10, 2) not null,
  due_date date not null,
  status text not null default 'SCHEDULED'
    check (status in ('SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'OVERDUE', 'CANCELLED')),
  paid_date date,
  payment_reference text,
  provider text,
  unique (agreement_id, payment_number)
);

-- ========== DEVICE CONTROL ==========
create table device_control (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references inventory (id) on delete cascade unique,
  provider text not null default 'mock',
  provider_device_id text,
  status text not null default 'NOT_REGISTERED'
    check (status in ('NOT_REGISTERED', 'REGISTERED', 'ACTIVE', 'RESTRICTION_PENDING', 'RESTRICTED', 'RESTORE_PENDING', 'ERROR', 'RELEASED')),
  last_command text,
  last_command_at timestamptz,
  last_response text,
  restriction_reason text,
  restricted_at timestamptz,
  restored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== AUDIT LOG ==========
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity text not null,
  entity_id uuid not null,
  metadata jsonb not null default '{}',
  timestamp timestamptz not null default now()
);

-- ========== NOTIFICATIONS ==========
create table notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles (id),
  type text not null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== DEVICE-CONTROL BUSINESS RULES (configurable, not hard-coded) ==========
create table device_control_rules (
  id uuid primary key default gen_random_uuid(),
  grace_period_days int not null default 5,
  restrict_after_days_overdue int not null default 7,
  updated_at timestamptz not null default now()
);

insert into device_control_rules (grace_period_days, restrict_after_days_overdue) values (5, 7);

-- ===================================================================
-- ROW LEVEL SECURITY
-- ===================================================================

alter table profiles enable row level security;
alter table products enable row level security;
alter table rental_plans enable row level security;
alter table inventory enable row level security;
alter table applications enable row level security;
alter table agreements enable row level security;
alter table payment_schedule enable row level security;
alter table device_control enable row level security;
alter table audit_logs enable row level security;
alter table notifications enable row level security;
alter table device_control_rules enable row level security;

-- Helper: is the current user an admin?
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'ADMIN'
  );
$$ language sql security definer stable;

-- Profiles: a user can see/update their own profile; admins see all.
create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- Products & rental plans: public read of ACTIVE items; admin manages all.
create policy "products_public_read" on products
  for select using (status = 'ACTIVE' or is_admin());
create policy "products_admin_write" on products
  for all using (is_admin()) with check (is_admin());

create policy "rental_plans_public_read" on rental_plans
  for select using (status = 'ACTIVE' or is_admin());
create policy "rental_plans_admin_write" on rental_plans
  for all using (is_admin()) with check (is_admin());

-- Inventory: customers see only their own allocated device; admins see all.
create policy "inventory_own_or_admin" on inventory
  for select using (customer_id = auth.uid() or is_admin());
create policy "inventory_admin_write" on inventory
  for all using (is_admin()) with check (is_admin());

-- Applications: customers manage their own; admins manage all.
create policy "applications_own_or_admin_select" on applications
  for select using (customer_id = auth.uid() or is_admin());
create policy "applications_own_insert" on applications
  for insert with check (customer_id = auth.uid());
create policy "applications_own_update_draft" on applications
  for update using (customer_id = auth.uid() and status in ('DRAFT', 'MORE_INFORMATION_REQUIRED'));
create policy "applications_admin_update" on applications
  for update using (is_admin());

-- Agreements: customers see only their own; only admins/system create or edit.
create policy "agreements_own_or_admin_select" on agreements
  for select using (customer_id = auth.uid() or is_admin());
create policy "agreements_admin_write" on agreements
  for all using (is_admin()) with check (is_admin());

-- Payment schedule: customers see only their own; only admins/system edit.
create policy "payments_own_or_admin_select" on payment_schedule
  for select using (customer_id = auth.uid() or is_admin());
create policy "payments_admin_write" on payment_schedule
  for all using (is_admin()) with check (is_admin());

-- Device control: customers may read the control status of their own device
-- (needed to show the restriction banner); only admins/system may write.
create policy "device_control_own_or_admin_select" on device_control
  for select using (
    is_admin() or
    device_id in (select id from inventory where customer_id = auth.uid())
  );
create policy "device_control_admin_write" on device_control
  for all using (is_admin()) with check (is_admin());

-- Audit logs: admin-only.
create policy "audit_logs_admin_only" on audit_logs
  for select using (is_admin());

-- Notifications: customers see only their own.
create policy "notifications_own_select" on notifications
  for select using (customer_id = auth.uid() or is_admin());
create policy "notifications_own_update" on notifications
  for update using (customer_id = auth.uid());

-- Device control rules: readable by admins only (used server-side by jobs).
create policy "device_control_rules_admin_only" on device_control_rules
  for select using (is_admin());
