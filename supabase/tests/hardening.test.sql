-- Hardening after the Nov 2026 review (20261118100000_harden_api_writes.sql).
-- Run with `npm run db:test` against the linked DEVELOPMENT project only.

-- See rls.test.sql: the hosted test login needs postgres's privileges.
set role postgres;
set search_path = public, extensions;

begin;
create extension if not exists pgtap with schema extensions;

select plan(11);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c3', 'signup@test.invalid');

-- ---------------------------------------------------------------------------
-- Anyone who signs up must not be able to create or change anything (5)
-- ---------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}', true);

select throws_ok(
  $$insert into public.events (owner_id, slug, languages, status, starts_at, rsvp_deadline, contact_phone)
    values ('00000000-0000-0000-0000-0000000000c3', 'support', 'en', 'published',
            now() + interval '2 days', now() + interval '1 day', '+43 660 000 0000')$$,
  '42501', null, 'a signed-up user cannot create (or publish) an event');
select throws_ok(
  $$insert into public.event_hosts (host, event_id)
    select 'hijack.example.com', id from public.events where slug = 'layla-and-adam'$$,
  '42501', null, 'a signed-up user cannot claim a host');
select throws_ok(
  $$insert into public.media (event_id, kind, url, position)
    select id, 'gallery', '/images/x.png', 99 from public.events where slug = 'layla-and-adam'$$,
  '42501', null, 'a signed-up user cannot add media');
select throws_ok(
  $$delete from public.content$$,
  '42501', null, 'a signed-up user cannot delete content');
select throws_ok(
  $$delete from public.rsvps$$,
  '42501', null, 'a signed-up user cannot delete rsvps');

set local role postgres;

-- ---------------------------------------------------------------------------
-- Constraints (5)
-- ---------------------------------------------------------------------------
create function pg_temp.slug_is_accepted(candidate text) returns boolean
language plpgsql as $$
begin
  insert into public.events (slug, languages, starts_at, rsvp_deadline, contact_phone)
  values (candidate, 'en', now() + interval '2 days', now() + interval '1 day', '+43 660 000 0000');
  return true;
exception when check_violation then
  return false;
end;
$$;

select ok(not pg_temp.slug_is_accepted('www'), 'the slug www is reserved');
select ok(not pg_temp.slug_is_accepted('sample'), 'the slug sample is reserved');
select ok(pg_temp.slug_is_accepted('sara-and-omar-2027'), 'a normal couple slug is accepted');

select throws_ok(
  $$insert into public.media (event_id, kind, url, position)
    select id, 'gallery', '//evil.example.com/x.png', 99 from public.events where slug = 'layla-and-adam'$$,
  '23514', null, 'media urls cannot be protocol-relative');

insert into public.events (id, slug, languages, starts_at, rsvp_deadline, contact_phone)
values ('20000000-0000-0000-0000-000000000001', 'no-names-yet', 'en',
        now() + interval '2 days', now() + interval '1 day', '+43 660 000 0000');
select throws_ok(
  $$update public.events set status = 'published' where slug = 'no-names-yet'$$,
  '23514', null, 'an event cannot be published without the couple''s names');

-- ---------------------------------------------------------------------------
-- Future tables get no public access by default (1)
-- ---------------------------------------------------------------------------
create table public.zz_future_table (id integer);
select ok(
  not has_table_privilege('anon', 'public.zz_future_table', 'select')
    and not has_table_privilege('authenticated', 'public.zz_future_table', 'insert'),
  'a new table in public is not readable or writable by anon/authenticated until granted');

select * from finish();
rollback;
