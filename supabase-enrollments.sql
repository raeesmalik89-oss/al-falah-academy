-- Al-Falah Academy — schema for website Enrollment submissions
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (IF NOT EXISTS / idempotent policy drops).
--
-- Stores leads submitted from the public enroll.html form so they appear in the
-- Admin and CEO dashboards. A PostgreSQL table holds far more than 100–200 rows
-- (thousands are fine on the Supabase free tier) — no capacity sizing is needed.

create table if not exists enrollments (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  enroll_for   text,          -- "Enrolling For" (self / child …)
  age          text,
  gender       text,
  country      text,
  city         text,
  level        text,          -- current Quran level
  course       text,
  lang         text,          -- preferred language
  teacher_pref text,          -- male / female teacher preference
  pref_time    text,          -- preferred time slot
  freq         text,          -- classes per week
  phone        text,          -- WhatsApp number
  email        text,
  parent       text,
  notes        text,
  status       text default 'new',   -- new / contacted / enrolled
  created_at   timestamptz default now()
);

create index if not exists enrollments_created_idx on enrollments (created_at desc);

alter table enrollments enable row level security;

-- The public enrollment form (an anonymous visitor using the anon key) may INSERT.
drop policy if exists "public can submit enrollment" on enrollments;
create policy "public can submit enrollment" on enrollments
  for insert to anon, authenticated with check (true);

-- Signed-in staff (admin / ceo / teacher) may read, update status, and delete.
drop policy if exists "staff manage enrollments" on enrollments;
create policy "staff manage enrollments" on enrollments
  for all to authenticated using (true) with check (true);
