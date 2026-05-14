-- SkillSync Supabase table for storing student assessment records.
-- Run this in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.student_assessments (
  id uuid primary key default gen_random_uuid(),
  respondent_code text not null,
  responses jsonb not null,
  competency_scores jsonb not null,
  top_results jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.student_assessments enable row level security;

-- Allows the deployed SkillSync app to insert assessment records using the anon key.
-- Keep SELECT restricted for privacy; you can view records in the Supabase dashboard as the project owner.
drop policy if exists "Allow anonymous assessment inserts" on public.student_assessments;
create policy "Allow anonymous assessment inserts"
on public.student_assessments
for insert
to anon
with check (true);
