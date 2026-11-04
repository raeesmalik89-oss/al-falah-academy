-- Al-Falah Academy — direct student→teacher assignment
-- Run ONCE in Supabase → SQL Editor. Idempotent (safe to re-run).
--
-- Adds profiles.teacher_id so a student can be assigned to ONE specific teacher
-- (set from the CEO/Admin dashboard's "Teacher" dropdown on each student row).
-- The teacher then sees that student in their dashboard, and the student joins
-- that teacher's live class — independent of class_name.

alter table profiles add column if not exists teacher_id uuid references profiles(id) on delete set null;

create index if not exists profiles_teacher_idx on profiles (teacher_id);
