-- Al-Falah Academy — let staff (CEO / Admin / Teacher) manage student records
-- Run this ONCE in Supabase → SQL Editor → New query → paste → Run.
-- Safe + idempotent (drops each policy by name before recreating it) and ADDITIVE:
-- it only widens access for staff and keeps students' own-row access intact.
--
-- WHY: The CEO/Admin dashboard's "📚 Manage" button writes the same tables the
-- teacher dashboard does — progress, attendance, exam_results. If those tables'
-- row-level security only allowed the 'teacher' role, a CEO/Admin would get
-- "new row violates row-level security policy". This grants all staff roles
-- (teacher, admin, ceo) full manage rights, and lets each student read their own
-- progress / attendance / exam rows (so the student portal keeps working).

-- Reuse (or create) the staff check. SECURITY DEFINER reads profiles without
-- being blocked by that table's own RLS, which avoids recursion.
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

-- ========================= progress =========================
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

-- ========================= attendance =========================
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

-- ========================= exam_results =========================
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

-- Done. Reload the CEO/Admin dashboard → open a student → Manage → everything saves.
