-- Journal for everyone (change request 2026-11-04).
--
-- Every account has a journal, whether or not it has bought a protocol. An entry belongs to the
-- person; it only belongs to a protocol when it comes from that protocol's practice room or lessons.
--
--   kind 'own'      a free note              protocol_id must be null   no purchase needed
--   kind 'exercise' a note about a free      protocol_id must be null   no purchase needed
--                   exercise (content_id)
--   kind 'practice' | 'advanced' | 'lesson'  protocol_id required       writing needs access (unchanged)
--
-- A refunded customer therefore keeps their journal and can still write their own notes.
-- The table is empty today, so nothing needs migrating. The journal stays strictly private:
-- there is still no policy for the admin, and the table name keeps its protocol_ prefix because
-- the database is shared with other sites.

alter table public.protocol_journal_entries alter column protocol_id drop not null;

alter table public.protocol_journal_entries
  add column content_id uuid references public.content (id) on delete set null;

alter table public.protocol_journal_entries drop constraint protocol_journal_entries_kind_check;
alter table public.protocol_journal_entries
  add constraint protocol_journal_entries_kind_check
  check (kind in ('practice', 'advanced', 'lesson', 'own', 'exercise'));

alter table public.protocol_journal_entries
  add constraint protocol_journal_kind_shape
  check (
    (kind in ('own', 'exercise') and protocol_id is null)
    or (kind in ('practice', 'advanced', 'lesson') and protocol_id is not null)
  );

alter table public.protocol_journal_entries
  add constraint protocol_journal_text_length check (char_length(text) <= 10000);

create index protocol_journal_user_created_idx on public.protocol_journal_entries (user_id, created_at desc);
create index protocol_journal_content_idx on public.protocol_journal_entries (content_id);

-- Writing: your own rows only; a protocol entry also needs access to that protocol.
drop policy "Users can add own journal entries" on public.protocol_journal_entries;
create policy "Users can add own journal entries" on public.protocol_journal_entries
  for insert to authenticated
  with check (auth.uid() = user_id and (protocol_id is null or public.has_protocol_access(protocol_id)));

drop policy "Users can edit own journal entries" on public.protocol_journal_entries;
create policy "Users can edit own journal entries" on public.protocol_journal_entries
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and (protocol_id is null or public.has_protocol_access(protocol_id)));
