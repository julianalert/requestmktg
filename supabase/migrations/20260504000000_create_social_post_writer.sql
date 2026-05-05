-- Social Post Writer: stores generated LinkedIn posts per profile and idea
create table if not exists public.social_post_writer_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,          -- 'jb' | 'ludo' | 'simran'
  idea_id integer not null,          -- idea id within the profile's idea list
  post_intent text,
  trigger_or_spark text,
  post_text text not null,
  created_at timestamp with time zone default now()
);

alter table public.social_post_writer_posts enable row level security;

create policy "Allow all" on public.social_post_writer_posts
  for all using (true) with check (true);

create index if not exists social_post_writer_posts_profile_id_idx
  on public.social_post_writer_posts (profile_id);

create index if not exists social_post_writer_posts_profile_idea_idx
  on public.social_post_writer_posts (profile_id, idea_id);
