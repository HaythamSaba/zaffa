-- Hardening after the Nov 2026 database and security reviews.
--
-- 1. No writes through the API for signed-in users. Anyone can sign up to a
--    Supabase project, and auth.uid() = owner_id alone let any new account
--    create and publish events or claim custom domains. Until the admin page
--    exists, the admin edits with Supabase Studio or the service role, and
--    the couple's dashboard (week 3) uses the service role in server code.
--    Owners keep read access to their own rows.
-- 2. Reserved slugs that would collide with platform subdomains or paths.
-- 3. media.url can't be protocol-relative ("//host/x").
-- 4. Publishing requires the couple's names in every shown language.
-- 5. New tables, functions and sequences in public get no anon/authenticated
--    access by default; each must be granted explicitly in its migration.

-- 1. -------------------------------------------------------------------------
revoke insert, update, delete on public.events, public.event_hosts, public.content, public.media
  from authenticated;
revoke update, delete on public.rsvps from authenticated;

drop policy "Owners create their events" on public.events;
drop policy "Owners update their events" on public.events;
drop policy "Owners delete their events" on public.events;

drop policy "Owners manage their hosts" on public.event_hosts;
drop policy "Owners manage their content" on public.content;
drop policy "Owners manage their media" on public.media;

create policy "Owners read their hosts"
  on public.event_hosts for select to authenticated
  using ((select private.owns_event(event_id)));
create policy "Owners read their content"
  on public.content for select to authenticated
  using ((select private.owns_event(event_id)));
create policy "Owners read their media"
  on public.media for select to authenticated
  using ((select private.owns_event(event_id)));

drop policy "Owners correct their rsvps" on public.rsvps;
drop policy "Owners delete their rsvps" on public.rsvps;

-- 2. -------------------------------------------------------------------------
alter table public.events add constraint events_slug_not_reserved check (
  slug not in (
    'www', 'app', 'api', 'admin', 'dashboard', 'mail', 'support', 'help', 'status',
    'sample', 'demo', 'sites', 'preview', 'static', 'assets', 'images', 'zaffa',
    'invitation-unavailable'
  )
);

-- 3. -------------------------------------------------------------------------
alter table public.media drop constraint media_url_check;
alter table public.media add constraint media_url_check
  check (char_length(url) <= 2048 and url ~ '^(https://|/[^/])');

-- 4. -------------------------------------------------------------------------
create or replace function private.check_event_content_on_publish()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  missing_key text;
begin
  if new.status <> 'published' then
    return new;
  end if;

  if not exists (
    select 1 from public.content c
    where c.event_id = new.id
      and c.key = 'names'
      and private.content_row_is_complete(new.languages, c.text_en, c.text_ar)
  ) then
    raise exception 'cannot publish "%": the couple''s names are missing for "%"', new.slug, new.languages
      using errcode = 'check_violation';
  end if;

  select c.key into missing_key
  from public.content c
  where c.event_id = new.id
    and not private.content_row_is_complete(new.languages, c.text_en, c.text_ar)
  limit 1;

  if missing_key is not null then
    raise exception 'content "%" is missing a language required by "%"', missing_key, new.languages
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke all on function private.check_event_content_on_publish() from public;

-- 5. -------------------------------------------------------------------------
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on functions from anon, authenticated, public;
