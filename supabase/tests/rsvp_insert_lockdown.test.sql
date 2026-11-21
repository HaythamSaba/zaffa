-- Week 3 lockdown: the server action (service role) is the only RSVP writer.
-- Run with `npm run db:test` against the linked dev project (supabase link).
-- Everything runs inside one transaction that is rolled back at the end.

set role postgres;
set search_path = public, extensions;

begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

-- ---------------------------------------------------------------------------
-- Fixtures (as the postgres superuser, which bypasses RLS)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email)
values ('00000000-0000-0000-0000-0000000000c3', 'lockdown-owner@test.invalid');

insert into public.events
  (id, owner_id, slug, languages, status, package, starts_at, timezone, venue,
   rsvp_deadline, contact_phone, dashboard_password_hash)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000c3',
   'test-lockdown-open', 'en', 'draft', 'essential', now() + interval '60 days', 'Europe/Vienna',
   'Somewhere', now() + interval '30 days', '+43 660 000 0001', 'hash-lockdown');

insert into public.content (event_id, key, text_en)
values ('20000000-0000-0000-0000-000000000001', 'names', 'Lockdown Test');

update public.events set status = 'published' where slug = 'test-lockdown-open';

-- ---------------------------------------------------------------------------
-- anon can no longer insert, even into an open, published event (1)
-- ---------------------------------------------------------------------------
set local role anon;

select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('20000000-0000-0000-0000-000000000001', 'A guest', 1, true)$$,
  '42501', null, 'anon can no longer insert an RSVP directly; the server action is the only writer');

-- ---------------------------------------------------------------------------
-- authenticated (not the owner) can no longer insert either (2)
-- ---------------------------------------------------------------------------
set local role postgres;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000099","role":"authenticated"}', true);

select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('20000000-0000-0000-0000-000000000001', 'A guest', 1, true)$$,
  '42501', null, 'authenticated can no longer insert an RSVP directly either');

-- ---------------------------------------------------------------------------
-- the owner can't insert through the API either: same service-role-only rule (3)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}', true);

select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('20000000-0000-0000-0000-000000000001', 'A guest', 1, true)$$,
  '42501', null, 'even the owner cannot insert an RSVP through the API');

-- ---------------------------------------------------------------------------
-- the dropped policy's helper function is gone (4)
-- ---------------------------------------------------------------------------
set local role postgres;

select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'private' and p.proname = 'event_accepts_rsvps'),
  0,
  'the unused event_accepts_rsvps helper was dropped with its policy');

select * from finish();
rollback;
