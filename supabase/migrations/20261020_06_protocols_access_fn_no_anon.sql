-- Protocols build, Phase 1f: anonymous visitors do not need has_protocol_access().
-- Signed-in users and the server still can; row-level security policies that call it
-- are only ever evaluated for roles that hold a SELECT grant on those tables (not anon).
revoke execute on function public.has_protocol_access(uuid) from anon;
