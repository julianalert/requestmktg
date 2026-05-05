create table if not exists public.marketing_kpi (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  traffic integer not null default 0,
  signups integer not null default 0,
  demo_bookings integer not null default 0,
  demo_completed integer not null default 0,
  paid_users integer not null default 0,
  club_members_onboarded integer not null default 0,
  created_at timestamptz default now()
);

alter table public.marketing_kpi enable row level security;

create policy "Allow all" on public.marketing_kpi
  for all using (true) with check (true);
