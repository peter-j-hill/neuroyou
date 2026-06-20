-- NeuroYou MVP — Supabase schema
-- Run this in the Supabase SQL Editor (supabase.com > your project > SQL Editor)

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  purchased_neutralize boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Free exercises
create table public.free_exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  audio_url text,
  category text,
  created_at timestamptz not null default now()
);

-- Blog / research articles
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  published_at timestamptz not null default now()
);

-- Neutralize modules
create table public.neutralize_modules (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null unique,
  title text not null,
  video_url text,
  audio_url text,
  slides_url text,
  body_text text,
  created_at timestamptz not null default now()
);

-- Module completion progress
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  module_id uuid references public.neutralize_modules(id) on delete cascade not null,
  completed_at timestamptz not null default now(),
  unique(user_id, module_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.free_exercises enable row level security;
alter table public.blog_posts enable row level security;
alter table public.neutralize_modules enable row level security;
alter table public.module_progress enable row level security;

-- Profiles: users can read and update their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Free exercises: public read
create policy "Public can read exercises"
  on public.free_exercises for select using (true);

-- Blog posts: public read
create policy "Public can read blog posts"
  on public.blog_posts for select using (true);

-- Neutralize modules: authenticated users can read (purchase check is in application code)
create policy "Authenticated users can read modules"
  on public.neutralize_modules for select using (auth.role() = 'authenticated');

-- Module progress: users can read/write their own
create policy "Users can read own progress"
  on public.module_progress for select using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.module_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.module_progress for update using (auth.uid() = user_id);
