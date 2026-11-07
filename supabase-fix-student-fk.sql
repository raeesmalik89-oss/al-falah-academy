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
