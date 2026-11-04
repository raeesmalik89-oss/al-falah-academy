-- Al-Falah Academy — Row-Level Security for the "announcements" table
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent: IF NOT EXISTS + policy drops before create).
--
-- WHY: Posting an announcement from the CEO / Admin / Teacher dashboard failed with
--   "new row violates row-level security policy for table \"announcements\""
-- That means RLS is on but no INSERT policy permits the signed-in staff member to
-- add a row. This script (re)creates clean policies:
--   • any signed-in user may READ announcements (students/teachers see them)
--   • only staff (role = teacher / admin / ceo) may INSERT, UPDATE or DELETE.
-- The app uses exactly these four roles in profiles.role: student, teacher, admin, ceo.

-- 1) Make sure the table exists with the columns the dashboards write.
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  body         text,
  teacher_name text,                        -- display name of the poster
  audience     text default 'all',          -- all / teachers / students / admins
  created_at   timestamptz default now()
);

-- If the table already existed without these, add them (no-op otherwise).
alter table public.announcements add column if not exists audience text default 'all';
alter table public.announcements add column if not exists teacher_name text;

create index if not exists announcements_created_idx
  on public.announcements (created_at desc);

-- 2) Helper that answers "is the current user a staff member?"
--    SECURITY DEFINER lets it read profiles regardless of that table's own RLS,
--    which avoids any RLS recursion and makes the check reliable.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('teacher', 'admin', 'ceo')
  );
$$;

grant execute on function public.is_staff() to authenticated;

-- 3) Turn RLS on and (re)create the policies.
alter table public.announcements enable row level security;

-- READ: every signed-in user can see announcements.
drop policy if exists "read announcements" on public.announcements;
create policy "read announcements" on public.announcements
  for select to authenticated
  using (true);

-- INSERT: staff only. This is the policy that was missing / too strict.
drop policy if exists "staff insert announcements" on public.announcements;
create policy "staff insert announcements" on public.announcements
  for insert to authenticated
  with check (public.is_staff());

-- UPDATE: staff only.
drop policy if exists "staff update announcements" on public.announcements;
create policy "staff update announcements" on public.announcements
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- DELETE: staff only (the dashboards have a Delete button).
drop policy if exists "staff delete announcements" on public.announcements;
create policy "staff delete announcements" on public.announcements
  for delete to authenticated
  using (public.is_staff());

-- Done. Reload the CEO dashboard and post again — it should save and appear below.
