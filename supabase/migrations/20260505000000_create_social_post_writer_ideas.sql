-- AI-generated content ideas for the Social Post Writer agent
create table if not exists public.social_post_writer_ideas (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,            -- 'jb' | 'ludo' | 'simran'
  post_intent text not null,
  trigger_or_spark text not null,
  founder_pov text not null,
  audience text not null,
  sharpness integer not null,
  cta_style text not null,
  personal_detail_hint text not null,
  context_hint text,                   -- the "tell me more" input, stored for reference
  created_at timestamptz default now()
);

alter table public.social_post_writer_ideas enable row level security;

create policy "Allow all" on public.social_post_writer_ideas
  for all using (true) with check (true);

create index on public.social_post_writer_ideas (profile_id);
create index on public.social_post_writer_ideas (profile_id, created_at desc);
