# Supabase Schema

Phase 4A prepares the database schema only. It does not connect the Express server to Supabase yet.

## What the Migration Creates

- `public.profiles` for application users, roles, account status, password hashes, and timestamps.
- `public.resume_reports` for future resume analysis records linked to profiles.
- UUID defaults using `pgcrypto`.
- Case-insensitive email uniqueness with a `lower(email)` unique index.
- `updated_at` trigger support for both tables.
- Row Level Security enabled on both tables without public anon policies.

## Manual Supabase SQL Editor Step

Open the Supabase project SQL Editor, paste the contents of `migrations/001_initial_schema.sql`, and run it.

## Future Changes

Future schema changes must be added as new migration files. Do not edit an already-applied migration unless the database has not received it yet.

## Secrets

Supabase secret or service role keys must stay backend-only. Do not expose them in the browser or commit real values to Git.
