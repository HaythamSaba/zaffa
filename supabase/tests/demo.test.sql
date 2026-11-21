-- The demo couple (Layla & Adam) is published and complete, as a guest sees it.
-- Run with `npm run db:test` against the linked dev project.

-- See rls.test.sql: the hosted test login needs postgres's privileges.
set role postgres;
set search_path = public, extensions;

begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

set local role anon;

select results_eq(
  $$select status, package, languages, template_id, timezone
    from public.events where slug = 'layla-and-adam'$$,
  $$values ('published'::text, 'premium'::text, 'en+ar'::text, 'classic'::text, 'Europe/Vienna'::text)$$,
  'the demo is a published Premium classic invitation in English and Arabic');

select is(
  (select theme_settings ->> 'demo' from public.events where slug = 'layla-and-adam'), 'true',
  'the demo is flagged as a demo, so its RSVP form never saves');
select is(
  (select theme_settings ->> 'arabicLocale' from public.events where slug = 'layla-and-adam'), 'ar-EG',
  'the demo uses the default Arabic locale');

select is(
  (select starts_at from public.events where slug = 'layla-and-adam'),
  '2027-06-12 18:00:00 Europe/Vienna'::timestamptz,
  'the wedding starts on 12 June 2027 at 6 PM in Vienna');
select is(
  (select rsvp_deadline from public.events where slug = 'layla-and-adam'),
  '2027-05-01 23:59:59 Europe/Vienna'::timestamptz,
  'replies close at the end of 1 May 2027 in Vienna');

select is(
  (select count(*)::int from public.content c
   join public.events e on e.id = c.event_id where e.slug = 'layla-and-adam'),
  12, 'the demo has all 12 content rows');
select is_empty(
  $$select c.key from public.content c join public.events e on e.id = c.event_id
    where e.slug = 'layla-and-adam'
      and (coalesce(btrim(c.text_en), '') = '' or coalesce(btrim(c.text_ar), '') = '')$$,
  'every demo text exists in English and Arabic');
select ok(
  (select bool_and(c.text_ar ~ '[؀-ۿ]') from public.content c
   join public.events e on e.id = c.event_id where e.slug = 'layla-and-adam'),
  'every Arabic text is written in Arabic script');

select is_empty(
  $$select s ->> 'id' from public.events e,
      jsonb_array_elements(e.theme_settings -> 'schedule') s
    where e.slug = 'layla-and-adam'
      and not exists (select 1 from public.content c
                      where c.event_id = e.id and c.key = 'schedule.' || (s ->> 'id') || '.title')$$,
  'every schedule item has a title in content');
select is(
  (select jsonb_array_length(theme_settings -> 'schedule') from public.events where slug = 'layla-and-adam'),
  4, 'the demo day has four schedule items');

select results_eq(
  $$select m.kind, count(*)::int from public.media m join public.events e on e.id = m.event_id
    where e.slug = 'layla-and-adam' group by m.kind order by m.kind$$,
  $$values ('gallery'::text, 4), ('hero'::text, 1)$$,
  'the demo has one couple photo and four gallery photos');
select is_empty(
  $$select m.url from public.media m join public.events e on e.id = m.event_id
    where e.slug = 'layla-and-adam'
      and (coalesce(m.alt_en, '') = '' or coalesce(m.alt_ar, '') = '')$$,
  'every demo photo has alt text in both languages');

-- rsvps is never readable by anon (see rls.test.sql); these two checks run
-- as postgres, the same way the fixtures above are set up.
set local role postgres;

select is(
  (select count(*)::int from public.rsvps r join public.events e on e.id = r.event_id
   where e.slug = 'layla-and-adam'),
  8, 'the demo has 8 fictional guest replies');
select results_eq(
  $$select (sum(guest_count) filter (where attending))::int,
           (count(*) filter (where not attending))::int
    from public.rsvps r join public.events e on e.id = r.event_id where e.slug = 'layla-and-adam'$$,
  $$values (17, 2)$$,
  'the demo replies total 17 attending and 2 declined households');

select * from finish();
rollback;
