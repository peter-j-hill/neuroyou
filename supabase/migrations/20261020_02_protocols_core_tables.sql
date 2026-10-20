-- Protocols build, Phase 1b: core tables, access function and row-level security.
-- Additive only. The database is shared with other sites, so every object is prefixed
-- protocol_ / protocols. Design: protocols-handoff/PHASE_0_TECHNICAL_DESIGN.md (sections 4 and 5).
--
-- Rules enforced here:
--   * Paid content (modules, lessons) is readable only by buyers (or the admin).
--   * Purchases are written only by the server (service role), never by a browser.
--   * Progress is written only by the server (it checks access and unlock rules).
--   * Journal entries are private: a student reads and writes only their own.

-- ── helpers ──────────────────────────────────────────────────────────────────

-- Same admin test the existing policies use (content, interest_registrations).
create or replace function public.protocol_is_admin()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce((auth.jwt() ->> 'email') = 'peter.j.hill@live.com', false)
$$;

-- ── protocols ────────────────────────────────────────────────────────────────

create table public.protocols (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title                    text not null,
  tagline                  text,
  sort_order               integer not null default 0,
  status                   text not null default 'draft' check (status in ('live', 'waitlist', 'draft')),
  prerequisite_protocol_id uuid references public.protocols (id) on delete set null,
  intro_video_ref          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ── purchases (written by the server only) ───────────────────────────────────

create table public.protocol_purchases (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references public.profiles (id) on delete set null,
  email                    text,
  protocol_id              uuid not null references public.protocols (id) on delete restrict,
  source                   text not null default 'stripe' check (source in ('stripe', 'admin_grant', 'legacy')),
  status                   text not null default 'active' check (status in ('active', 'refunded')),
  stripe_session_id        text unique,
  stripe_payment_intent_id text,
  amount_total             integer,
  amount_discount          integer,
  currency                 text,
  promo_code               text,
  livemode                 boolean,
  purchased_at             timestamptz not null default now(),
  refunded_at              timestamptz,
  note                     text,
  constraint protocol_purchases_stripe_needs_session check (source <> 'stripe' or stripe_session_id is not null)
);
-- One active purchase per person and protocol.
create unique index protocol_purchases_one_active
  on public.protocol_purchases (user_id, protocol_id)
  where status = 'active' and user_id is not null;
create index protocol_purchases_protocol_idx on public.protocol_purchases (protocol_id);
create index protocol_purchases_user_idx on public.protocol_purchases (user_id);

-- ── modules ──────────────────────────────────────────────────────────────────

create table public.protocol_modules (
  id                    uuid primary key default gen_random_uuid(),
  protocol_id           uuid not null references public.protocols (id) on delete cascade,
  ordinal               integer not null check (ordinal >= 0),
  slug                  text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title                 text not null,
  summary               text,
  -- Module opens once the module with this ordinal is finished (null = always open).
  unlock_after_ordinal  integer check (unlock_after_ordinal is null or unlock_after_ordinal < ordinal),
  status                text not null default 'draft' check (status in ('draft', 'published')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint protocol_modules_ordinal_key unique (protocol_id, ordinal) deferrable initially deferred,
  constraint protocol_modules_slug_key unique (protocol_id, slug),
  constraint protocol_modules_id_protocol_key unique (id, protocol_id)
);

-- ── lessons ──────────────────────────────────────────────────────────────────

create table public.protocol_lessons (
  id                uuid primary key default gen_random_uuid(),
  protocol_id       uuid not null,
  module_id         uuid not null,
  ordinal           integer not null check (ordinal >= 0),
  slug              text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind              text not null check (kind in (
                      'video', 'audio', 'reading', 'try_it', 'explorer',
                      'practice', 'check_in', 'care_note', 'journal_prompt')),
  title             text not null,
  duration_min      integer check (duration_min is null or duration_min >= 0),
  required          boolean not null default true,
  video_provider    text check (video_provider is null or video_provider in ('vimeo', 'mux', 'bunny')),
  video_ref         text,
  audio_path        text,        -- path in the private protocol-media bucket (added in a later phase)
  body_html         text,        -- Tiptap HTML, like articles
  transcript        jsonb,       -- [{ "t": seconds, "text": "..." }]
  chapters          jsonb,       -- [{ "t": seconds, "title": "..." }]
  -- A "Pause and try" is its own lesson in the outline and also opens in place at at_seconds in its parent video.
  parent_lesson_id  uuid references public.protocol_lessons (id) on delete set null,
  at_seconds        integer check (at_seconds is null or at_seconds >= 0),
  config            jsonb not null default '{}'::jsonb,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint protocol_lessons_module_fk
    foreign key (module_id, protocol_id) references public.protocol_modules (id, protocol_id) on delete cascade,
  constraint protocol_lessons_slug_key unique (protocol_id, slug),
  constraint protocol_lessons_ordinal_key unique (module_id, ordinal) deferrable initially deferred,
  constraint protocol_lessons_pause_point check ((parent_lesson_id is null) = (at_seconds is null))
);
create index protocol_lessons_module_idx on public.protocol_lessons (module_id);
create index protocol_lessons_parent_idx on public.protocol_lessons (parent_lesson_id);

-- ── progress (written by the server only) ────────────────────────────────────

create table public.protocol_lesson_progress (
  user_id                uuid not null references public.profiles (id) on delete cascade,
  lesson_id              uuid not null references public.protocol_lessons (id) on delete cascade,
  started_at             timestamptz not null default now(),
  completed_at           timestamptz,
  last_position_seconds  integer not null default 0 check (last_position_seconds >= 0),
  updated_at             timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index protocol_lesson_progress_lesson_idx on public.protocol_lesson_progress (lesson_id);

-- ── journal (private to each student) ────────────────────────────────────────

create table public.protocol_journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  protocol_id uuid not null references public.protocols (id) on delete cascade,
  kind        text not null check (kind in ('practice', 'advanced', 'lesson', 'own')),
  topic_kind  text check (topic_kind is null or topic_kind in ('emotion', 'sense')),
  topic       text,   -- e.g. 'frustrated' or 'sound'
  item        text,   -- e.g. 'traffic' (advanced practice only)
  result      text check (result is null or result in ('lighter', 'neutral', 'same', 'stronger')),
  lesson_id   uuid references public.protocol_lessons (id) on delete set null,
  text        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint protocol_journal_topic_pair check ((topic_kind is null) = (topic is null))
);
create index protocol_journal_user_idx on public.protocol_journal_entries (user_id, protocol_id, created_at desc);
create index protocol_journal_topic_idx on public.protocol_journal_entries (user_id, topic);
create index protocol_journal_lesson_idx on public.protocol_journal_entries (lesson_id);

-- ── updated_at triggers (public.set_updated_at already exists) ───────────────

create trigger protocols_set_updated_at          before update on public.protocols                 for each row execute function public.set_updated_at();
create trigger protocol_modules_set_updated_at   before update on public.protocol_modules          for each row execute function public.set_updated_at();
create trigger protocol_lessons_set_updated_at   before update on public.protocol_lessons          for each row execute function public.set_updated_at();
create trigger protocol_progress_set_updated_at  before update on public.protocol_lesson_progress  for each row execute function public.set_updated_at();
create trigger protocol_journal_set_updated_at   before update on public.protocol_journal_entries  for each row execute function public.set_updated_at();

-- ── access function ──────────────────────────────────────────────────────────
-- True for the admin, or for a signed-in user with an active purchase of the protocol.
-- Security definer so it can read purchases regardless of the caller's own rights;
-- it only ever answers about auth.uid().

create or replace function public.has_protocol_access(p_protocol_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.protocol_is_admin()
      or exists (
        select 1
        from public.protocol_purchases pp
        where pp.user_id = auth.uid()
          and pp.protocol_id = p_protocol_id
          and pp.status = 'active'
      )
$$;
revoke all on function public.has_protocol_access(uuid) from public;
grant execute on function public.has_protocol_access(uuid) to anon, authenticated, service_role;

-- ── privileges: start from nothing, grant only what the browser needs ────────
-- (The profiles hole came from broad default grants; do not repeat it.)

revoke all on public.protocols, public.protocol_purchases, public.protocol_modules,
              public.protocol_lessons, public.protocol_lesson_progress, public.protocol_journal_entries
  from anon, authenticated;

grant select on public.protocols                to anon, authenticated;
grant select on public.protocol_purchases       to authenticated;
grant select on public.protocol_modules         to authenticated;
grant select on public.protocol_lessons         to authenticated;
grant select on public.protocol_lesson_progress to authenticated;
grant select, insert, update, delete on public.protocol_journal_entries to authenticated;

-- ── row-level security ───────────────────────────────────────────────────────

alter table public.protocols                enable row level security;
alter table public.protocol_purchases       enable row level security;
alter table public.protocol_modules         enable row level security;
alter table public.protocol_lessons         enable row level security;
alter table public.protocol_lesson_progress enable row level security;
alter table public.protocol_journal_entries enable row level security;

-- protocols: the public sees live and waitlist protocols; the admin sees and edits everything.
create policy "Public can read live and waitlist protocols" on public.protocols
  for select using (status in ('live', 'waitlist'));
create policy "Admin can read all protocols" on public.protocols
  for select using (public.protocol_is_admin());
create policy "Admin can write protocols" on public.protocols
  for all using (public.protocol_is_admin()) with check (public.protocol_is_admin());

-- purchases: a person reads their own; the admin reads and manages all. No other writes from a browser.
create policy "Users can read own purchases" on public.protocol_purchases
  for select using (auth.uid() = user_id);
create policy "Admin can manage purchases" on public.protocol_purchases
  for all using (public.protocol_is_admin()) with check (public.protocol_is_admin());

-- modules and lessons: buyers read published rows; the admin reads and edits everything.
create policy "Buyers can read published modules" on public.protocol_modules
  for select using (status = 'published' and public.has_protocol_access(protocol_id));
create policy "Admin can manage modules" on public.protocol_modules
  for all using (public.protocol_is_admin()) with check (public.protocol_is_admin());

create policy "Buyers can read published lessons" on public.protocol_lessons
  for select using (status = 'published' and public.has_protocol_access(protocol_id));
create policy "Admin can manage lessons" on public.protocol_lessons
  for all using (public.protocol_is_admin()) with check (public.protocol_is_admin());

-- progress: a student reads their own. Writes come from the server (service role bypasses RLS).
create policy "Users can read own progress" on public.protocol_lesson_progress
  for select using (auth.uid() = user_id);

-- journal: strictly private. Even the admin has no policy here.
create policy "Users can read own journal" on public.protocol_journal_entries
  for select using (auth.uid() = user_id);
create policy "Users can add own journal entries" on public.protocol_journal_entries
  for insert with check (auth.uid() = user_id and public.has_protocol_access(protocol_id));
create policy "Users can edit own journal entries" on public.protocol_journal_entries
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id and public.has_protocol_access(protocol_id));
create policy "Users can delete own journal entries" on public.protocol_journal_entries
  for delete using (auth.uid() = user_id);
