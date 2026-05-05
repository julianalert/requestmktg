-- Allow idea_id to be null for AI-generated ideas (which have UUID ids, not integer ids)
alter table public.social_post_writer_posts alter column idea_id drop not null;

-- Store the UUID of the AI-generated idea so we can show the ✓ "generated" state
alter table public.social_post_writer_posts
  add column if not exists db_idea_id uuid references public.social_post_writer_ideas(id);

create index if not exists social_post_writer_posts_db_idea_id_idx
  on public.social_post_writer_posts (db_idea_id);
