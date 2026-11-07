alter table profiles add column if not exists teacher_id uuid references profiles(id) on delete set null;

create index if not exists profiles_teacher_idx on profiles (teacher_id);
