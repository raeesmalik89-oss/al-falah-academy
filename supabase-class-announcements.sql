alter table public.announcements add column if not exists target_class text;

create index if not exists announcements_target_class_idx
  on public.announcements (target_class);
