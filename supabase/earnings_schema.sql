-- ==============================================================================
-- Bikash Chicken Point: PhonePe UPI Statements & Customer Intelligence Schema
-- Designed for Daily/Weekly PhonePe Business Statement CSV Ingestion
-- ==============================================================================

-- 1. Table for all PhonePe UPI Transactions (Deduplicated by Bank UTR)
create table if not exists public.shop_payments (
  id uuid primary key default gen_random_uuid(),
  provider_reference_id text not null unique, -- Bank UTR / UPI Reference Number (RRN)
  merchant_transaction_id text not null,      -- PhonePe / Internal Transaction ID
  phonepe_transaction_id text,                -- PhonePe Reference ID
  amount_paise bigint not null check (amount_paise > 0),
  amount_rupees numeric(10,2) generated always as (amount_paise / 100.0) stored,
  payment_mode text not null default 'UPI' check (payment_mode in ('UPI', 'PHONEPE_QR', 'STANDEE_CSV')),
  status text not null default 'COMPLETED' check (status in ('COMPLETED', 'FAILED', 'REFUNDED')),
  payer_vpa text,                             -- Customer UPI VPA (e.g. rahul@paytm, sourav@oksbi)
  payer_name text,                            -- Customer name if provided in statement
  payer_phone text,                           -- Masked phone or customer phone
  notes text,                                 -- Product cut / order description
  settlement_id text,                         -- PhonePe Settlement batch reference
  created_at timestamptz not null default now(),
  paid_at timestamptz not null default now()
);

create index if not exists idx_shop_payments_paid_at on public.shop_payments(paid_at desc);
create index if not exists idx_shop_payments_payer_vpa on public.shop_payments(payer_vpa);
create index if not exists idx_shop_payments_utr on public.shop_payments(provider_reference_id);

-- 2. Bank Settlements Ledger (from PhonePe statement settlement reports)
create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  settlement_id text not null unique,
  settlement_date date not null default current_date,
  gross_amount numeric(10,2) not null check (gross_amount >= 0),
  fee_amount numeric(10,2) not null default 0.00 check (fee_amount >= 0),
  tax_amount numeric(10,2) not null default 0.00 check (tax_amount >= 0),
  net_settled_amount numeric(10,2) not null check (net_settled_amount >= 0),
  bank_utr text,
  status text not null default 'SETTLED' check (status in ('SETTLED', 'PROCESSING', 'FAILED')),
  created_at timestamptz not null default now()
);

-- 3. Customer Intelligence View: Best Customers Leaderboard (সেরা গ্রাহক তালিকা)
create or replace view public.view_best_customers as
select
  coalesce(nullif(payer_vpa, ''), nullif(payer_phone, ''), 'Counter Walk-in UPI') as customer_identifier,
  max(payer_name) as customer_name,
  count(*) as total_visits,
  coalesce(sum(amount_rupees), 0)::numeric(10,2) as total_lifetime_spend,
  (coalesce(sum(amount_rupees), 0) / count(*))::numeric(10,2) as average_order_value,
  min(paid_at at time zone 'Asia/Kolkata')::date as first_visit_date,
  max(paid_at at time zone 'Asia/Kolkata')::date as last_visit_date,
  extract(day from (now() - max(paid_at)))::int as days_since_last_visit,
  case
    when count(*) >= 4 or sum(amount_rupees) >= 1500 then '👑 VIP Regular'
    when count(*) >= 2 or sum(amount_rupees) >= 600 then '⭐ Frequent'
    else '🌱 Occasional'
  end as loyalty_tier
from public.shop_payments
where status = 'COMPLETED'
group by 1
order by total_lifetime_spend desc;

-- 4. Weekly & Sunday Recap Analytics View (সাপ্তাহিক রিক্যাপ)
create or replace view public.view_weekly_recap as
select
  date_trunc('week', paid_at at time zone 'Asia/Kolkata')::date as week_start_date,
  count(*) as total_transactions,
  coalesce(sum(amount_rupees), 0)::numeric(10,2) as total_weekly_revenue,
  coalesce(sum(amount_rupees) filter (where extract(dow from paid_at at time zone 'Asia/Kolkata') = 0), 0)::numeric(10,2) as sunday_revenue,
  count(*) filter (where extract(dow from paid_at at time zone 'Asia/Kolkata') = 0) as sunday_orders,
  (coalesce(sum(amount_rupees), 0) / nullif(count(*), 0))::numeric(10,2) as weekly_aov,
  count(distinct coalesce(nullif(payer_vpa, ''), payer_phone)) as unique_customers
from public.shop_payments
where status = 'COMPLETED'
group by 1
order by 1 desc;

-- 5. Row Level Security (RLS)
alter table public.shop_payments enable row level security;
alter table public.settlements enable row level security;

create policy "Owner has full access to shop payments"
on public.shop_payments for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

create policy "Owner has full access to settlements"
on public.settlements for all
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

-- 6. Seed Data: Realistic Weekly Chicken Shop Customers from PhonePe Statement
insert into public.shop_payments (
  provider_reference_id,
  merchant_transaction_id,
  phonepe_transaction_id,
  amount_paise,
  payment_mode,
  status,
  payer_vpa,
  payer_name,
  notes,
  paid_at
)
values
  -- Subrata Da (Local Roll Counter Owner - Bulk Party Buyer)
  ('424519284102', 'BKP_TXN_0901_01', 'T260901083011', 126000, 'UPI', 'COMPLETED', 'subrata.rolls@oksbi', 'Subrata Da (Roll Corner)', '6kg Curry Cut (Morning Bulk)', now() - interval '4 days'),
  ('424519395211', 'BKP_TXN_0903_02', 'T260903084522', 105000, 'UPI', 'COMPLETED', 'subrata.rolls@oksbi', 'Subrata Da (Roll Corner)', '5kg Curry Cut (Bulk)', now() - interval '2 days'),
  ('424519881023', 'BKP_TXN_0905_03', 'T260905091533', 147000, 'UPI', 'COMPLETED', 'subrata.rolls@oksbi', 'Subrata Da (Roll Corner)', '7kg Curry Cut (Weekend Bulk)', now() - interval '3 hours'),

  -- Dr. S. Banerjee (VIP Sunday Regular - Boneless Breast & Leg)
  ('424520112903', 'BKP_TXN_0828_04', 'T260828094511', 72000, 'UPI', 'COMPLETED', 'dr.sbanerjee@hdfcbank', 'Dr. S. Banerjee', '2kg Boneless Breast', now() - interval '8 days'),
  ('424520223914', 'BKP_TXN_0901_05', 'T260901101509', 56000, 'UPI', 'COMPLETED', 'dr.sbanerjee@hdfcbank', 'Dr. S. Banerjee', '2kg Leg Pieces (Sunday prep)', now() - interval '4 days'),
  ('424520334925', 'BKP_TXN_0905_06', 'T260905100520', 72000, 'UPI', 'COMPLETED', 'dr.sbanerjee@hdfcbank', 'Dr. S. Banerjee', '2kg Boneless Breast', now() - interval '2 hours'),

  -- Sourav Mondal (Weekly Sunday Family Buyer)
  ('424410129481', 'BKP_TXN_0825_07', 'T260825091512', 33000, 'UPI', 'COMPLETED', 'sourav.m@oksbi', 'Sourav Mondal', '1.5kg Curry Cut', now() - interval '11 days'),
  ('424410294812', 'BKP_TXN_0901_08', 'T260901093015', 33000, 'UPI', 'COMPLETED', 'sourav.m@oksbi', 'Sourav Mondal', '1.5kg Curry Cut', now() - interval '4 days'),
  ('424410395823', 'BKP_TXN_0905_09', 'T260905103045', 33000, 'UPI', 'COMPLETED', 'sourav.m@oksbi', 'Sourav Mondal', '1.5kg Curry Cut', now() - interval '1 hour'),

  -- Anita Dey (Family Home Cook - Biryani & Curry)
  ('424319485710', 'BKP_TXN_0830_10', 'T260830112001', 54000, 'UPI', 'COMPLETED', 'anita.dey@ybl', 'Anita Dey', '1.5kg Boneless Breast', now() - interval '6 days'),
  ('424319586721', 'BKP_TXN_0905_11', 'T260905111530', 42000, 'UPI', 'COMPLETED', 'anita.dey@ybl', 'Anita Dey', '2kg Whole Chicken', now() - interval '45 minutes'),

  -- Rahul Sen (Regular Office Meal Prep)
  ('424219384711', 'BKP_TXN_0902_12', 'T260902120045', 28000, 'UPI', 'COMPLETED', 'rahul98@paytm', 'Rahul Sen', '1kg Leg Pieces', now() - interval '3 days'),
  ('424219485822', 'BKP_TXN_0905_13', 'T260905121015', 28000, 'UPI', 'COMPLETED', 'rahul98@paytm', 'Rahul Sen', '1kg Leg Pieces', now() - interval '20 minutes')
on conflict (provider_reference_id) do nothing;

-- Recent Bank Settlements from PhonePe
insert into public.settlements (
  settlement_id,
  settlement_date,
  gross_amount,
  fee_amount,
  tax_amount,
  net_settled_amount,
  bank_utr,
  status
)
values
  ('SETTL_BKP_20260904', current_date - 1, 3780.00, 0.00, 0.00, 3780.00, 'YESB00000019284102', 'SETTLED'),
  ('SETTL_BKP_20260901', current_date - 4, 8420.00, 0.00, 0.00, 8420.00, 'YESB00000019172401', 'SETTLED')
on conflict (settlement_id) do nothing;
