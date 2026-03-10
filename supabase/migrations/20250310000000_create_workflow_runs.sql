-- Workflow runs: stores CRO and SEO audit results for "Previous runs"
create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id text not null,
  input jsonb not null,
  result text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_workflow_runs_workflow_id on workflow_runs (workflow_id);
create index if not exists idx_workflow_runs_created_at on workflow_runs (created_at desc);

comment on table workflow_runs is 'Stores CRO and SEO workflow run results for Previous runs feature';
comment on column workflow_runs.workflow_id is 'conversion-rate-optimizer or seo-audit';
comment on column workflow_runs.input is 'JSON: { url, conversionGoal? }';
comment on column workflow_runs.result is 'Markdown analysis/audit output';
