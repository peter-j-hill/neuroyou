-- Protocols build, Phase 1d: carry any existing Neutralize buyers into protocol_purchases.
-- On 2026-10-20 there were 0 buyers (0 of 21 accounts), so this inserts nothing today; it is
-- kept as a safety net for anyone who buys before the new checkout ships. Idempotent.
insert into public.protocol_purchases (user_id, email, protocol_id, source, status, note)
select pr.id, u.email, p.id, 'legacy', 'active', 'Backfilled from profiles.purchased_neutralize'
from public.profiles pr
join auth.users u on u.id = pr.id
cross join public.protocols p
where p.slug = 'neutralize'
  and pr.purchased_neutralize
  and not exists (
    select 1 from public.protocol_purchases x
    where x.user_id = pr.id and x.protocol_id = p.id and x.status = 'active');
