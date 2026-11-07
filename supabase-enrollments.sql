create table if not exists enrollments (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  enroll_for   text,
  age          text,
  gender       text,
  country      text,
  city         text,
  level        text,
  course       text,
  lang         text,
  teacher_pref text,
  pref_time    text,
  freq         text,
  phone        text,
  email        text,
  parent       text,
  notes        text,
  status       text default 'new',
  created_at   timestamptz default now()
);

create index if not exists enrollments_created_idx on enrollments (created_at desc);

alter table enrollments enable row level security;

drop policy if exists "public can submit enrollment" on enrollments;
create policy "public can submit enrollment" on enrollments
  for insert to anon, authenticated with check (true);

drop policy if exists "staff manage enrollments" on enrollments;
create policy "staff manage enrollments" on enrollments
  for all to authenticated using (true) with check (true);
