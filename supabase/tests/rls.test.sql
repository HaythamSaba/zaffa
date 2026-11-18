-- Row-level security and constraint tests for the invitation core schema.
-- Run with `npm run db:test` against the linked dev project (supabase link).
-- Everything runs inside one transaction that is rolled back at the end.

-- The CLI's hosted test login (cli_login_postgres) does not inherit postgres's
-- privileges, and its search_path omits extensions, where pgTAP lives.
set role postgres;
set search_path = public, extensions;

begin;
create extension if not exists pgtap with schema extensions;

select plan(44);

-- ---------------------------------------------------------------------------
-- Fixtures (as the postgres superuser, which bypasses RLS)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-0000000000a1', 'owner@test.invalid'),
  ('00000000-0000-0000-0000-0000000000b2', 'other@test.invalid');

insert into public.events
  (id, owner_id, slug, languages, status, package, starts_at, timezone, venue,
   rsvp_deadline, contact_phone, dashboard_password_hash, preview_token_hash)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000a1',
   'test-open', 'en+ar', 'draft', 'premium', now() + interval '60 days', 'Europe/Vienna',
   'Rosengasse 12, Vienna', now() + interval '30 days', '+43 660 000 0000', 'hash-open', 'token-open'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-0000000000a1',
   'test-draft', 'en', 'draft', 'essential', now() + interval '60 days', 'Europe/Berlin',
   'Somewhere', now() + interval '30 days', '+49 151 0000000', 'hash-draft', 'token-draft'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-0000000000a1',
   'test-closed', 'ar', 'draft', 'essential', now() + interval '10 days', 'Europe/Stockholm',
   'Somewhere', now() - interval '1 day', '+46 70 000 0000', 'hash-closed', null);

insert into public.content (event_id, key, text_en, text_ar)
values
  ('10000000-0000-0000-0000-000000000001', 'names', 'Test & Test', 'اختبار واختبار'),
  ('10000000-0000-0000-0000-000000000002', 'names', 'Draft & Draft', null),
  ('10000000-0000-0000-0000-000000000003', 'names', null, 'مغلق ومغلق');

-- Publish after the content exists (publishing requires the names).
update public.events set status = 'published' where slug in ('test-open', 'test-closed');

insert into public.media (event_id, kind, url, position)
values
  ('10000000-0000-0000-0000-000000000001', 'hero', '/images/test.jpg', 0),
  ('10000000-0000-0000-0000-000000000002', 'hero', '/images/draft.jpg', 0);

insert into public.event_hosts (host, event_id)
values
  ('test-open.example.com', '10000000-0000-0000-0000-000000000001'),
  ('test-draft.example.com', '10000000-0000-0000-0000-000000000002');

insert into public.rsvps (event_id, name, guest_count, attending)
values ('10000000-0000-0000-0000-000000000001', 'Existing household', 2, true);

-- ---------------------------------------------------------------------------
-- RLS is on for every table (5)
-- ---------------------------------------------------------------------------
select ok(relrowsecurity, format('RLS is enabled on %s', relname))
from pg_class
where oid in ('public.events'::regclass, 'public.event_hosts'::regclass,
              'public.content'::regclass, 'public.media'::regclass, 'public.rsvps'::regclass)
order by relname;

-- ---------------------------------------------------------------------------
-- Constraints, as postgres (9)
-- ---------------------------------------------------------------------------
select throws_ok(
  $$update public.events set slug = 'Bad Slug' where slug = 'test-open'$$,
  '23514', null, 'slug must be lowercase words joined by hyphens');
select throws_ok(
  $$update public.events set timezone = 'Mars/Olympus' where slug = 'test-open'$$,
  '23514', null, 'timezone must be a valid IANA name');
select throws_ok(
  $$update public.events set rsvp_deadline = starts_at + interval '1 day' where slug = 'test-open'$$,
  '23514', null, 'rsvp_deadline cannot be after the wedding');
select throws_ok(
  $$update public.events set languages = 'fr' where slug = 'test-open'$$,
  '23514', null, 'languages is en, ar or en+ar');
select throws_ok(
  $$insert into public.event_hosts (host, event_id) values ('Upper.Example.com', '10000000-0000-0000-0000-000000000001')$$,
  '23514', null, 'hosts are stored lowercase');
select throws_ok(
  $$insert into public.event_hosts (host, event_id) values ('test.example.com:3000', '10000000-0000-0000-0000-000000000001')$$,
  '23514', null, 'hosts never include a port');

-- Publishing checks every content row has text for each of the event's languages.
update public.events set languages = 'en+ar' where slug = 'test-draft';
select throws_ok(
  $$update public.events set status = 'published' where slug = 'test-draft'$$,
  '23514', null, 'cannot publish an en+ar event whose content lacks Arabic text');
select throws_ok(
  $$insert into public.content (event_id, key, text_en) values ('10000000-0000-0000-0000-000000000001', 'story', 'English only')$$,
  '23514', null, 'cannot add content missing a language to a published en+ar event');
select throws_ok(
  $$update public.events set theme_settings = '[]'::jsonb where slug = 'test-open'$$,
  '23514', null, 'theme_settings must be a JSON object');

-- ---------------------------------------------------------------------------
-- anon: any guest on the internet (21)
-- ---------------------------------------------------------------------------
set local role anon;

select results_eq(
  $$select slug from public.events where slug like 'test-%' order by slug$$,
  $$values ('test-closed'::text), ('test-open'::text)$$,
  'anon sees published events only');
select throws_ok($$select dashboard_password_hash from public.events$$, '42501', null,
  'anon cannot read dashboard_password_hash');
select throws_ok($$select preview_token_hash from public.events$$, '42501', null,
  'anon cannot read preview_token_hash');
select throws_ok($$select owner_id from public.events$$, '42501', null,
  'anon cannot read owner_id');
select is(
  (select count(*)::int from public.content where event_id::text like '10000000-%'), 2,
  'anon reads content of published events only');
select is(
  (select count(*)::int from public.media where event_id::text like '10000000-%'), 1,
  'anon reads media of published events only');
select results_eq(
  $$select host from public.event_hosts where host like 'test-%' order by host$$,
  $$values ('test-open.example.com'::text)$$,
  'anon resolves hosts of published events only');

select throws_ok($$select id from public.rsvps$$, '42501', null,
  'anon can never read rsvps');

select lives_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending, notes)
    values ('10000000-0000-0000-0000-000000000001', 'The Haddad family', 2, true, 'Vegetarian')$$,
  'anon can RSVP to a published event before its deadline');
select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000002', 'Draft guest', 1, true)$$,
  '42501', null, 'anon cannot RSVP to a draft event');
select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000003', 'Late guest', 1, true)$$,
  '42501', null, 'anon cannot RSVP after the deadline');

select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000001', 'Nobody', 0, true)$$,
  '23514', null, 'guest_count must be at least 1');
select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000001', 'Everyone', 21, true)$$,
  '23514', null, 'guest_count is at most 20');
select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000001', '   ', 1, true)$$,
  '23514', null, 'name cannot be blank');
select throws_ok(
  format($$insert into public.rsvps (event_id, name, guest_count, attending)
    values ('10000000-0000-0000-0000-000000000001', %L, 1, true)$$, repeat('a', 121)),
  '23514', null, 'name is at most 120 characters');
select throws_ok(
  format($$insert into public.rsvps (event_id, name, guest_count, attending, notes)
    values ('10000000-0000-0000-0000-000000000001', 'Long notes', 1, true, %L)$$, repeat('a', 1001)),
  '23514', null, 'notes are at most 1000 characters');
select throws_ok(
  $$insert into public.rsvps (event_id, name, guest_count, attending, created_at)
    values ('10000000-0000-0000-0000-000000000001', 'Time traveller', 1, true, '2000-01-01')$$,
  '42501', null, 'anon cannot set created_at');

select throws_ok($$update public.events set venue = 'Hacked'$$, '42501', null,
  'anon cannot update events');
select throws_ok(
  $$insert into public.events (slug, languages, starts_at, rsvp_deadline, contact_phone)
    values ('anon-event', 'en', now() + interval '2 days', now() + interval '1 day', '+43 660 000 0000')$$,
  '42501', null, 'anon cannot create events');
select throws_ok($$delete from public.rsvps$$, '42501', null,
  'anon cannot delete rsvps');
select throws_ok($$update public.content set text_en = 'Hacked'$$, '42501', null,
  'anon cannot update content');

-- ---------------------------------------------------------------------------
-- authenticated, not the owner (4)
-- ---------------------------------------------------------------------------
set local role postgres;
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);

select results_eq(
  $$select slug from public.events where slug like 'test-%' order by slug$$,
  $$values ('test-closed'::text), ('test-open'::text)$$,
  'another signed-in user sees published events only');
select is((select count(*)::int from public.rsvps), 0,
  'another signed-in user reads no rsvps');
select throws_ok(
  $$update public.content set text_en = 'Hijacked'
    where event_id = '10000000-0000-0000-0000-000000000001'$$,
  '42501', null, 'another signed-in user cannot edit someone else''s content');
select throws_ok($$select dashboard_password_hash from public.events$$, '42501', null,
  'signed-in users cannot read dashboard_password_hash');

-- ---------------------------------------------------------------------------
-- authenticated owner (5)
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);

select results_eq(
  $$select slug from public.events where slug like 'test-%' order by slug$$,
  $$values ('test-closed'::text), ('test-draft'::text), ('test-open'::text)$$,
  'the owner sees their own drafts');
select is((select count(*)::int from public.rsvps), 2,
  'the owner reads the rsvps of their events');
-- No writes through the API, not even for owners, until the admin page
-- exists: the admin edits with Supabase Studio or the service role.
select throws_ok(
  $$update public.content set text_en = 'Edited & Edited'
    where event_id = '10000000-0000-0000-0000-000000000001' and key = 'names'$$,
  '42501', null, 'owners cannot write content through the API');
select throws_ok(
  $$update public.rsvps set guest_count = 3 where name = 'Existing household'$$,
  '42501', null, 'owners cannot change rsvps through the API (the dashboard uses the service role)');
select throws_ok($$select preview_token_hash from public.events$$, '42501', null,
  'even the owner cannot read hashes through the API');

set local role postgres;

select * from finish();
rollback;
