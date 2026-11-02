-- Protocols build, Phase 1e: let the admin's signed-in browser session edit protocol content.
-- Migration 02 granted the browser read access only, so the admin-only write policies
-- ("Admin can manage ...") could never take effect. Writes still require the admin policy:
-- every other signed-in user is blocked by row-level security (same model as the content table).
-- Progress and journal are NOT included: progress is written only by the server, and the
-- journal already has its own per-user policies.
grant insert, update, delete on public.protocols          to authenticated;
grant insert, update, delete on public.protocol_modules   to authenticated;
grant insert, update, delete on public.protocol_lessons   to authenticated;
grant insert, update, delete on public.protocol_purchases to authenticated;
