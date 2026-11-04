-- Al-Falah Academy — enable sending announcements to a specific class
-- Run ONCE in Supabase → SQL Editor → Run. Safe to re-run.
--
-- Adds a column so an announcement can target one class (e.g. "Hifz",
-- "Fahm-ul-Quran"). When target_class is set, only students in that class see it;
-- when it's null, the existing audience (all/students/teachers/admins) applies.

alter table public.announcements add column if not exists target_class text;

create index if not exists announcements_target_class_idx
  on public.announcements (target_class);
