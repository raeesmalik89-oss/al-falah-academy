create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text,
  body         text,
  teacher_name text,
  audience     text default 'all',
  created_at   timestamptz default now()
);

alter table public.announcements add column if not exists audience text default 'all';
alter table public.announcements add column if not exists teacher_name text;

create index if not exists announcements_created_idx
  on public.announcements (created_at desc);

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

alter table public.announcements enable row level security;

drop policy if exists "read announcements" on public.announcements;
create policy "read announcements" on public.announcements
  for select to authenticated
  using (true);

drop policy if exists "staff insert announcements" on public.announcements;
create policy "staff insert announcements" on public.announcements
  for insert to authenticated
  with check (public.is_staff());

drop policy if exists "staff update announcements" on public.announcements;
create policy "staff update announcements" on public.announcements
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "staff delete announcements" on public.announcements;
create policy "staff delete announcements" on public.announcements
  for delete to authenticated
  using (public.is_staff());
