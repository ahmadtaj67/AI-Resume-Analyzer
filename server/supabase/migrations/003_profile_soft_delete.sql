-- Phase 8B - Admin user management soft delete support
-- Soft-deleted users keep their profile row and resume reports.

alter table public.profiles
  add column if not exists deleted_at timestamptz;

create index if not exists profiles_deleted_at_idx
  on public.profiles (deleted_at);

comment on column public.profiles.deleted_at is
  'Soft delete marker for admin user management. Null means the profile is not deleted.';
