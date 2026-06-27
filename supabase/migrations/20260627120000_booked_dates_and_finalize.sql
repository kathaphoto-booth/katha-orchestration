-- New table: booked_dates
create table if not exists public.booked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz default now()
);

create index if not exists booked_dates_date_idx on public.booked_dates (date);

alter table public.booked_dates enable row level security;

drop policy if exists "anyone can read booked dates" on public.booked_dates;
create policy "anyone can read booked dates"
  on public.booked_dates for select using (true);

-- No insert/update/delete policy → only service_role can mutate.

-- New leads columns for portal finalization
alter table public.leads
  add column if not exists final_template_id text,
  add column if not exists final_date date,
  add column if not exists notes text,
  add column if not exists finalized_at timestamptz;
