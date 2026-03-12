-- SEO Agent: keyword opportunities from DataForSEO (related keywords, suggestions, ideas)
create table if not exists seo_keyword_opportunities (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  primary_keyword text not null,
  type text not null check (type in ('related_keywords', 'keyword_suggestions', 'keyword_ideas')),
  msv int,
  search_intent text,
  kw_difficulty int,
  competition float,
  cpc float,
  created_at timestamptz not null default now()
);

create index if not exists idx_seo_keyword_opportunities_primary on seo_keyword_opportunities (primary_keyword);
create index if not exists idx_seo_keyword_opportunities_created_at on seo_keyword_opportunities (created_at desc);

comment on table seo_keyword_opportunities is 'SEO Agent: keyword variations from DataForSEO Labs (related, suggestions, ideas)';
comment on column seo_keyword_opportunities.type is 'related_keywords | keyword_suggestions | keyword_ideas';
comment on column seo_keyword_opportunities.msv is 'Monthly search volume';
