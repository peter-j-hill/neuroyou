-- Protocols build, Phase 1a (applied to the live database 2026-10-20, approved by Peter).
-- Signed-in users could set profiles.purchased_neutralize = true on their own row,
-- because the authenticated role held UPDATE on every column. Only the server
-- (service role) writes access flags; users may edit their own name only.
-- No code in this app updates profiles from a browser; peterjonathanhill.com and the
-- Job Search site do not reference this table (checked 2026-10-20).
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;
