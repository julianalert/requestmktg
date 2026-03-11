-- SEO Agent: primary keywords per run (from "Generate primary keywords")
create table if not exists seo_primary_keywords (
  id uuid primary key default gen_random_uuid(),
  keywords jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists idx_seo_primary_keywords_created_at on seo_primary_keywords (created_at desc);

comment on table seo_primary_keywords is 'SEO Agent: primary keywords (cumulative per generation, no duplicates)';
comment on column seo_primary_keywords.keywords is 'Array of objects: { keyword, location, language, limit, depth }. Defaults: location "United States", language "English", limit 200, depth 2';
