create table if not exists public.content_pieces (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.content_ideas(id) on delete set null,
  type text not null,
  category text not null,
  headline text not null,
  content jsonb not null,
  created_at timestamptz default now()
);

alter table public.content_pieces enable row level security;

create policy "Allow all" on public.content_pieces
  for all using (true) with check (true);
