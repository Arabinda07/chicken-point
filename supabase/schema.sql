create extension if not exists pgcrypto;

create table public.products (
  id text primary key,
  name text not null,
  name_bengali text not null,
  price_per_kg numeric(8,2) not null check (price_per_kg > 0),
  is_available boolean not null default true,
  display_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  order_code char(4) not null,
  order_date date not null default current_date,
  customer_name text not null,
  phone text not null,
  product_id text not null references public.products(id),
  product_name text not null,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  cut_style text not null check (cut_style in ('curry', 'biryani', 'fry')),
  pickup_time text not null,
  request_invoice boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (order_date, order_code)
);

create table public.profiles (
  phone text primary key,
  total_kg numeric(8,2) not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

create or replace function public.add_booking_loyalty()
returns trigger
language plpgsql
as $$
begin
  insert into public.profiles (phone, total_kg)
  values (new.phone, new.weight_kg)
  on conflict (phone)
  do update set
    total_kg = public.profiles.total_kg + excluded.total_kg,
    updated_at = now();

  return new;
end;
$$;

create trigger bookings_add_loyalty
after insert on public.bookings
for each row execute function public.add_booking_loyalty();

create or replace function public.get_loyalty_by_phone(input_phone text)
returns table(total_kg numeric)
language sql
security definer
set search_path = public
as $$
  select coalesce((select p.total_kg from public.profiles p where p.phone = input_phone), 0)::numeric;
$$;

alter table public.products enable row level security;
alter table public.bookings enable row level security;
alter table public.profiles enable row level security;

grant select on table public.products to anon, authenticated;
grant insert on table public.bookings to anon, authenticated;
grant select, update on table public.products to authenticated;
grant select, update on table public.bookings to authenticated;
grant execute on function public.get_loyalty_by_phone(text) to anon, authenticated;

create policy "Anyone can view available products"
on public.products for select
using (true);

create policy "Anyone can create booking"
on public.bookings for insert
with check (true);

create policy "Owner can manage products"
on public.products for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

create policy "Owner can view bookings"
on public.bookings for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

create policy "Owner can update bookings"
on public.bookings for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

insert into public.products (id, name, name_bengali, price_per_kg, is_available, display_order)
values
  ('curry-cut', 'Curry cut', 'কারি কাট', 220, true, 10),
  ('whole-chicken', 'Whole chicken cut', 'পুরো চিকেন কাট', 210, true, 20),
  ('boneless-breast', 'Boneless breast', 'বোনলেস ব্রেস্ট', 360, true, 30),
  ('drumsticks', 'Drumsticks', 'লেগ পিস', 280, true, 40),
  ('leg-pieces', 'Leg pieces', 'থাই ও লেগ', 280, true, 50),
  ('keema', 'Chicken keema', 'চিকেন কিমা', 320, true, 60),
  ('liver-gizzard', 'Liver & gizzard', 'লিভার ও গিজার্ড', 180, false, 70),
  ('bulk-party', 'Bulk / party order', 'বড় অর্ডার', 210, true, 80);
