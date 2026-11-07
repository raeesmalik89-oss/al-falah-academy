alter table profiles add column if not exists class_name text;

create table if not exists exam_results (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  title      text not null,
  subject    text,
  obtained   numeric,
  total      numeric default 100,
  exam_date  date default current_date,
  remarks    text,
  created_at timestamptz default now()
);

create index if not exists exam_results_student_idx on exam_results (student_id);

alter table exam_results enable row level security;
drop policy if exists "authenticated full access" on exam_results;
create policy "authenticated full access" on exam_results
  for all to authenticated using (true) with check (true);
