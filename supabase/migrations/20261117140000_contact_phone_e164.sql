-- Tighten events.contact_phone to E.164: a "+", a country code that does not
-- start with 0, and 7-15 digits in total. Spaces are allowed for readability
-- ("+49 151 23456789"); hyphens, letters and a "00" prefix are not.
-- Existing rows (the demo, "+43 660 000 0000") already satisfy it.

alter table public.events drop constraint events_contact_phone_check;

alter table public.events add constraint events_contact_phone_check check (
  contact_phone ~ '^\+[1-9][0-9 ]*[0-9]$'
  and char_length(regexp_replace(contact_phone, '[^0-9]', '', 'g')) between 7 and 15
  and char_length(contact_phone) <= 24
);
