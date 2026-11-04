-- Al-Falah Academy — enable attachment links on teacher notes
-- Run ONCE in Supabase → SQL Editor → Run. Safe to re-run.
--
-- Adds a column to store an optional attachment link (Google Drive / PDF / video
-- URL) that staff can attach to a student's note. The student sees an
-- "📎 Open attachment" button in their portal.

alter table public.progress add column if not exists note_link text;
