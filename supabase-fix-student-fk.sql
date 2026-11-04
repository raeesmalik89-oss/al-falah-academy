-- Al-Falah Academy — fix student foreign keys so records work for ALL students
-- Run ONCE in Supabase → SQL Editor → Run. Idempotent and self-correcting.
--
-- WHY: attendance/exam_results/progress had a foreign key on the student id that
-- pointed at auth.users. Madrasah/roster students live only in `profiles` (they
-- never signed up through auth), so marking their attendance/exams/progress failed
-- with: violates foreign key constraint "attendance_student_id_fkey".
-- This repoints those foreign keys to profiles(id), which covers BOTH online
-- (auth) students and madrasah/roster students.

do $$
declare r record;
begin
  -- attendance.student_id  -> profiles(id)
  for r in
    select con.conname
    from pg_constraint con
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any(con.conkey)
    where con.conrelid = 'public.attendance'::regclass
      and con.contype = 'f' and a.attname = 'student_id'
  loop execute 'alter table public.attendance drop constraint ' || quote_ident(r.conname); end loop;
  alter table public.attendance
    add constraint attendance_student_id_fkey
    foreign key (student_id) references public.profiles(id) on delete cascade;

  -- exam_results.student_id -> profiles(id)
  for r in
    select con.conname
    from pg_constraint con
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any(con.conkey)
    where con.conrelid = 'public.exam_results'::regclass
      and con.contype = 'f' and a.attname = 'student_id'
  loop execute 'alter table public.exam_results drop constraint ' || quote_ident(r.conname); end loop;
  alter table public.exam_results
    add constraint exam_results_student_id_fkey
    foreign key (student_id) references public.profiles(id) on delete cascade;

  -- progress.id -> profiles(id)
  for r in
    select con.conname
    from pg_constraint con
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any(con.conkey)
    where con.conrelid = 'public.progress'::regclass
      and con.contype = 'f' and a.attname = 'id'
  loop execute 'alter table public.progress drop constraint ' || quote_ident(r.conname); end loop;
  alter table public.progress
    add constraint progress_id_fkey
    foreign key (id) references public.profiles(id) on delete cascade;
end $$;

-- Done. Reload the CEO dashboard → Teacher Room → mark attendance for any
-- student (including madrasah/roster students) — it now saves.
