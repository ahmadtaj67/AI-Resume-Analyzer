-- AI Resume Analyzer - Platform settings
-- Settings are display-only content managed by backend-verified admins.
-- Do not store HTML, JavaScript, secrets, API keys, passwords, or executable code here.

create table if not exists public.platform_settings (
  id boolean primary key default true,
  platform_name text not null default 'AI Resume Analyzer',
  platform_tagline text not null default 'Smart Career Insights',
  dashboard_welcome_title text not null default 'Welcome back',
  dashboard_welcome_message text not null default 'This workspace is ready for your upcoming resume analysis tools. Uploads, scoring, and recruiter-focused insights will become available in later phases.',
  announcement text not null default '',
  resume_upload_instructions text not null default 'Select one PDF resume for AI analysis. The validated report will be saved to your report history.',
  current_plan_name text not null default 'Free',
  maintenance_message text not null default '',
  maintenance_mode boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint platform_settings_single_row check (id = true),
  constraint platform_settings_no_html check (
    platform_name !~ '[<>]' and
    platform_tagline !~ '[<>]' and
    dashboard_welcome_title !~ '[<>]' and
    dashboard_welcome_message !~ '[<>]' and
    announcement !~ '[<>]' and
    resume_upload_instructions !~ '[<>]' and
    current_plan_name !~ '[<>]' and
    maintenance_message !~ '[<>]'
  )
);

insert into public.platform_settings (id)
values (true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'platform_settings_set_updated_at'
      and tgrelid = 'public.platform_settings'::regclass
  ) then
    create trigger platform_settings_set_updated_at
      before update on public.platform_settings
      for each row
      execute function public.set_updated_at();
  end if;
end;
$$;

alter table public.platform_settings enable row level security;

comment on table public.platform_settings is
  'Safe display settings for the application. Admin authorization is enforced by trusted Express middleware; no direct browser writes are granted.';
