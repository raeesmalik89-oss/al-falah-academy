-- Al-Falah Academy — schema for Classes + Exams/Report Cards
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / idempotent policy drop).

-- 1) CLASSES: a simple class/level label on each student profile
--    e.g. "Hifz - Level 1", "Nazra - Morning", "Qaida - Beginners"
alter table profiles add column if not exists class_name text;

-- 2) EXAMS / REPORT CARDS: one row per exam result per student
create table if not exists exam_results (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  title      text not null,            -- e.g. "Monthly Test - October"
  subject    text,                     -- e.g. "Tajweed", "Hifz", "Nazra"
  obtained   numeric,                  -- marks obtained
  total      numeric default 100,      -- total marks
  exam_date  date default current_date,
  remarks    text,
  created_at timestamptz default now()
);

create index if not exists exam_results_student_idx on exam_results (student_id);

-- Row Level Security: any signed-in user (student/teacher/admin) can read & write,
-- matching how this project's other tables work. Tighten later if needed.
alter table exam_results enable row level security;
drop policy if exists "authenticated full access" on exam_results;
create policy "authenticated full access" on exam_results
  for all to authenticated using (true) with check (true);
