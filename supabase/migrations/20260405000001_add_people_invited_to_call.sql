alter table public.club_funnel
  add column if not exists people_invited_to_call integer not null default 0;
