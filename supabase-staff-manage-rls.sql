create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin', 'ceo')
  );
$$;
grant execute on function public.is_staff() to authenticated;

alter table public.progress enable row level security;

drop policy if exists "staff manage progress" on public.progress;
create policy "staff manage progress" on public.progress
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "student reads own progress" on public.progress;
create policy "student reads own progress" on public.progress
  for select to authenticated
  using (id = auth.uid());

alter table public.attendance enable row level security;

drop policy if exists "staff manage attendance" on public.attendance;
create policy "staff manage attendance" on public.attendance
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "student reads own attendance" on public.attendance;
create policy "student reads own attendance" on public.attendance
  for select to authenticated
  using (student_id = auth.uid());

alter table public.exam_results enable row level security;

drop policy if exists "staff manage exam_results" on public.exam_results;
create policy "staff manage exam_results" on public.exam_results
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "student reads own exam_results" on public.exam_results;
create policy "student reads own exam_results" on public.exam_results
  for select to authenticated
  using (student_id = auth.uid());
