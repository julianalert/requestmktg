create table if not exists public.club_funnel (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  visitors integer not null default 0,
  application_page_views integer not null default 0,
  applications integer not null default 0,
  onboarding_calls integer not null default 0,
  people_invited integer not null default 0,
  people_joined integer not null default 0,
  request_finance_demos integer not null default 0,
  created_at timestamptz default now()
);

alter table public.club_funnel enable row level security;

create policy "Allow all" on public.club_funnel
  for all using (true) with check (true);
