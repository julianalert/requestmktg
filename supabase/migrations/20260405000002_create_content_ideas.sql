create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  headline text not null,
  draft text not null,
  target_persona text not null,
  channel text not null,
  engagement_cta text not null,
  created_at timestamptz default now()
);

alter table public.content_ideas enable row level security;

create policy "Allow all" on public.content_ideas
  for all using (true) with check (true);
