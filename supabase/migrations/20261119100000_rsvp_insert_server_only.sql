-- Week 3: RSVPs are now saved by a server action (zod validation, honeypot,
-- per-IP rate limit, a fresh server-side deadline check) that writes with the
-- service role, which bypasses RLS entirely. The public INSERT grant and its
-- policy are no longer needed and are revoked: the server action becomes the
-- only writer, closing the direct-PostgREST-insert attack surface that used
-- to be the only way to RSVP.
--
-- Rollback (forward-only in production): a new migration that re-adds the
-- grant and policy from supabase/migrations/20261117120000_invitations_core.sql.

revoke insert (event_id, name, guest_count, attending, notes) on public.rsvps from anon, authenticated;

drop policy "Guests reply to open published events" on public.rsvps;

-- Only that policy used this helper.
revoke execute on function private.event_accepts_rsvps(uuid) from anon, authenticated;
drop function private.event_accepts_rsvps(uuid);
