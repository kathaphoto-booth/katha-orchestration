-- Katha booking — availability admin portal backend
-- Applied to Supabase project hvvomiyskizxzhyytcfd on 2026-07-02 (migration: availability_allowlist_and_admin_portal).
-- Saved here for reproducibility. Additive only — does not touch leads / selections / booked_dates.

create table if not exists public.available_dates (
  date        date primary key,
  status      text not null default 'open',      -- 'open' | 'booked'
  note        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.available_dates enable row level security;

create table if not exists public.admins (
  email     text primary key,
  added_at  timestamptz default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
  language sql security definer stable
  set search_path = public
as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'));
$$;

drop policy if exists "public can read available dates" on public.available_dates;
create policy "public can read available dates"
  on public.available_dates for select using (true);

drop policy if exists "admins insert available dates" on public.available_dates;
create policy "admins insert available dates"
  on public.available_dates for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update available dates" on public.available_dates;
create policy "admins update available dates"
  on public.available_dates for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete available dates" on public.available_dates;
create policy "admins delete available dates"
  on public.available_dates for delete to authenticated using (public.is_admin());

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins"
  on public.admins for select to authenticated using (public.is_admin());

-- Both Jed and his brother use the same business inbox:
insert into public.admins (email) values ('kathabooth@gmail.com') on conflict (email) do nothing;
