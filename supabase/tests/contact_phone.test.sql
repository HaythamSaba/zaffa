-- events.contact_phone accepts any international (E.164) number, written
-- with optional spaces, and rejects anything else.
-- Run with `npm run db:test` against the linked DEVELOPMENT project only.

-- See rls.test.sql: the hosted test login needs postgres's privileges.
set role postgres;
set search_path = public, extensions;

begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

create temporary table phone_cases (phone text, ok boolean, label text) on commit drop;
insert into phone_cases values
  ('+43 660 000 0000',   true,  'Austria'),
  ('+49 151 23456789',   true,  'Germany'),
  ('+46 70 123 45 67',   true,  'Sweden'),
  ('+31 6 12345678',     true,  'the Netherlands'),
  ('+1 212 555 0100',    true,  'North America'),
  ('+971501234567',      true,  'the UAE, without spaces'),
  ('+0 660 000 0000',    false, 'a country code starting with 0'),
  ('0043 660 000 0000',  false, 'a 00 prefix instead of +'),
  ('+49 1234 5678 9012 34', false, 'more than 15 digits'),
  ('+49 12',             false, 'fewer than 7 digits'),
  ('+49-151-2345678',    false, 'hyphens'),
  ('+49 151 CALL ME',    false, 'letters');

create function pg_temp.phone_is_accepted(candidate text) returns boolean
language plpgsql as $$
begin
  insert into public.events (slug, languages, starts_at, rsvp_deadline, contact_phone)
  values ('phone-test', 'en', now() + interval '2 days', now() + interval '1 day', candidate);
  delete from public.events where slug = 'phone-test';
  return true;
exception when check_violation then
  return false;
end;
$$;

select is(pg_temp.phone_is_accepted(phone), ok,
          format('%s %s: %s', case when ok then 'accepts' else 'rejects' end, label, phone))
from phone_cases;

select * from finish();
rollback;
