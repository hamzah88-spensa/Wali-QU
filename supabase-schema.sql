-- Supabase SQL Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Periods Table
create table public.periods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null, -- e.g., 2025/2026
  semester text not null, -- Ganjil/Genap
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Students Table
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  period_id uuid references public.periods on delete cascade not null,
  name text not null,
  nis text not null,
  class text not null,
  gender text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Mentoring Logs Table
create table public.mentoring_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  student_id uuid references public.students on delete cascade not null,
  date date not null,
  category text not null,
  description text not null,
  follow_up text,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Annual Plans Table
create table public.annual_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  period_id uuid references public.periods on delete cascade not null,
  academic_target text,
  talent_interest_target text,
  character_target text,
  strategy text,
  priority_program text,
  collaboration_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(period_id, user_id)
);

-- 5. Communications Table
create table public.communications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  student_id uuid references public.students on delete cascade not null,
  date date not null,
  type text not null,
  notes text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.periods enable row level security;
alter table public.students enable row level security;
alter table public.mentoring_logs enable row level security;
alter table public.annual_plans enable row level security;
alter table public.communications enable row level security;

-- Create Policies
create policy "Users can view their own periods" on public.periods for select using (auth.uid() = user_id);
create policy "Users can insert their own periods" on public.periods for insert with check (auth.uid() = user_id);
create policy "Users can update their own periods" on public.periods for update using (auth.uid() = user_id);
create policy "Users can delete their own periods" on public.periods for delete using (auth.uid() = user_id);

create policy "Users can view their own students" on public.students for select using (auth.uid() = user_id);
create policy "Users can insert their own students" on public.students for insert with check (auth.uid() = user_id);
create policy "Users can update their own students" on public.students for update using (auth.uid() = user_id);
create policy "Users can delete their own students" on public.students for delete using (auth.uid() = user_id);

create policy "Users can view their own mentoring_logs" on public.mentoring_logs for select using (auth.uid() = user_id);
create policy "Users can insert their own mentoring_logs" on public.mentoring_logs for insert with check (auth.uid() = user_id);
create policy "Users can update their own mentoring_logs" on public.mentoring_logs for update using (auth.uid() = user_id);
create policy "Users can delete their own mentoring_logs" on public.mentoring_logs for delete using (auth.uid() = user_id);

create policy "Users can view their own annual_plans" on public.annual_plans for select using (auth.uid() = user_id);
create policy "Users can insert their own annual_plans" on public.annual_plans for insert with check (auth.uid() = user_id);
create policy "Users can update their own annual_plans" on public.annual_plans for update using (auth.uid() = user_id);
create policy "Users can delete their own annual_plans" on public.annual_plans for delete using (auth.uid() = user_id);

create policy "Users can view their own communications" on public.communications for select using (auth.uid() = user_id);
create policy "Users can insert their own communications" on public.communications for insert with check (auth.uid() = user_id);
create policy "Users can update their own communications" on public.communications for update using (auth.uid() = user_id);
create policy "Users can delete their own communications" on public.communications for delete using (auth.uid() = user_id);
