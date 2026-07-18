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

-- ============================================================================
-- Job Search Website — shares this project/auth pool as a separate product.
-- Full schema/rationale lives in the Job-Search-Website repo's
-- job-search-website-mvp-brief.md (Section 8). Tables are job_search_-prefixed
-- to stay clearly separated from NeuroYou's own tables above. See that repo
-- for the actual migration; this comment exists so this schema.sql stays an
-- accurate picture of what's really in this database.
-- ============================================================================

-- ============================================================================
-- Unified content — shared with peterjonathanhill.com, a second product in
-- this same project. Full schema/rationale lives in the peterjonathanhill.com
-- repo. blog_posts above is retired in favor of `content` (site='neuroyou')
-- but is left in place, untouched, as a rollback safety net — not read by
-- the app anymore. This comment exists so this schema.sql stays an accurate
-- picture of what's really in this database.
--
-- content_type: article | paper | diagram | essay | presentation | video |
--               reading_list | book | talk | exercise
-- content_site: peterjonathanhill | neuroyou
-- content_status: draft | published
--
-- content(id, site, type, title, slug, excerpt, body_mdx, hero_asset,
--         video_url, audio_url, status, published_at, sort_order,
--         reading_time, created_at, updated_at, search_vector)
--         unique(site, slug)
-- themes(id, slug, title, question, description, sort_order)
-- domains(id, slug, title, sort_order)
-- tags(id, slug, title)
-- content_themes(content_id, theme_id), content_domains(content_id, domain_id),
-- content_tags(content_id, tag_id) — many-to-many joins
--
-- RLS: public select where status = 'published'; insert/update/delete gated
-- on auth.jwt()->>'email' = 'peter.j.hill@live.com' (same pattern as
-- blog_posts above). Same policy shape on themes/domains/tags/join tables,
-- but with public read (not gated on status).
-- ============================================================================
