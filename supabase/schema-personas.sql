-- Run this in the Supabase SQL Editor to create tables for personas and campaigns.

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  prompt_input text not null,
  name text not null,
  role text not null,
  headline text not null,
  meta jsonb not null default '[]',
  sections jsonb not null default '[]'
);

create table if not exists public.persona_campaigns (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references public.personas(id) on delete cascade,
  created_at timestamptz default now(),
  ad_angles jsonb not null default '[]',
  landing_page_hooks jsonb not null default '[]',
  sales_outreach_angles jsonb not null default '[]',
  seo_topics jsonb not null default '[]'
);

alter table public.personas enable row level security;
alter table public.persona_campaigns enable row level security;

create policy "Allow all for personas" on public.personas for all using (true) with check (true);
create policy "Allow all for persona_campaigns" on public.persona_campaigns for all using (true) with check (true);
