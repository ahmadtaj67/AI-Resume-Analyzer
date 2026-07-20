-- AI Resume Analyzer - Initial Supabase schema
-- Phase 4A prepares database tables only. Application authorization will be
-- enforced later by trusted Express JWT middleware using backend-only secrets.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  password_hash text not null,
  role text not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  original_file_name text not null,
  stored_file_url text,
  resume_text text,
  overall_score integer,
  analysis_result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resume_reports_user_id_fkey'
      and conrelid = 'public.resume_reports'::regclass
  ) then
    alter table public.resume_reports
      add constraint resume_reports_user_id_fkey
      foreign key (user_id)
      references public.profiles(id)
      on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'resume_reports_overall_score_check'
      and conrelid = 'public.resume_reports'::regclass
  ) then
    alter table public.resume_reports
      add constraint resume_reports_overall_score_check
      check (overall_score is null or overall_score between 0 and 100);
  end if;
end;
$$;

create unique index if not exists profiles_email_lower_unique_idx
  on public.profiles (lower(email));

create index if not exists profiles_role_idx
  on public.profiles (role);

create index if not exists profiles_is_active_idx
  on public.profiles (is_active);

create index if not exists resume_reports_user_id_idx
  on public.resume_reports (user_id);

create index if not exists resume_reports_created_at_idx
  on public.resume_reports (created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_profile_email()
returns trigger
language plpgsql
as $$
begin
  new.email = lower(trim(new.email));
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profiles_normalize_email'
      and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger profiles_normalize_email
      before insert or update of email on public.profiles
      for each row
      execute function public.normalize_profile_email();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profiles_set_updated_at'
      and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger profiles_set_updated_at
      before update on public.profiles
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'resume_reports_set_updated_at'
      and tgrelid = 'public.resume_reports'::regclass
  ) then
    create trigger resume_reports_set_updated_at
      before update on public.resume_reports
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.resume_reports enable row level security;

comment on table public.profiles is
  'Application profiles. Direct browser access is not granted in Phase 4A; authorization will be enforced later by Express JWT middleware.';

comment on table public.resume_reports is
  'Resume analysis report storage. Direct browser access is not granted in Phase 4A; authorization will be enforced later by Express JWT middleware.';

comment on index public.profiles_email_lower_unique_idx is
  'Case-insensitive unique email index. Email values are normalized to lowercase by trigger.';
