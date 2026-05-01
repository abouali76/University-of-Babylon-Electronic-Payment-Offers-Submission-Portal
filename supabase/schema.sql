-- Core tables for GitHub Pages + Supabase setup

-- Profiles: public info about auth users + roles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  role text not null default 'company',
  created_at timestamptz not null default now()
);

-- Submissions: one row per company user
create table if not exists public.submissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  status text not null default 'draft',
  evaluation_score integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  document_path text,
  last_updated timestamptz not null default now()
);

-- Keep last_updated current
create or replace function public.set_last_updated()
returns trigger as $$
begin
  new.last_updated = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists submissions_set_last_updated on public.submissions;
create trigger submissions_set_last_updated
before update on public.submissions
for each row execute function public.set_last_updated();

-- RLS
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

-- Helper: check admin role from auth metadata
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Profiles policies
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
on public.profiles for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "profiles admin insert" on public.profiles;
create policy "profiles admin insert"
on public.profiles for insert
with check (public.is_admin());

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

-- Submissions policies
drop policy if exists "submissions read own or admin" on public.submissions;
create policy "submissions read own or admin"
on public.submissions for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "submissions upsert own" on public.submissions;
create policy "submissions upsert own"
on public.submissions for insert
with check (auth.uid() = user_id);

drop policy if exists "submissions update own or admin" on public.submissions;
create policy "submissions update own or admin"
on public.submissions for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- Public rankings: allow anonymous read of FINAL submissions only (optional)
drop policy if exists "public final rankings read" on public.submissions;
create policy "public final rankings read"
on public.submissions for select
using (status = 'final');

