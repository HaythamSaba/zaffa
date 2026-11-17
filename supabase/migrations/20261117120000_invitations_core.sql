-- Invitation core: events, event_hosts, content, media, rsvps.
--
-- Security model (see CLAUDE.md "Security rules"):
-- * RLS is on for every table.
-- * The public (anon) reads only published events and their hosts, content
--   and media, and never the hash or owner columns (column-level grants).
-- * The public may insert an RSVP only for a published event before its
--   rsvp_deadline, and can never read rsvps.
-- * The signed-in owner (the admin) manages their own events.
-- * The couple's dashboard (week 3) reads rsvps in server code with the
--   service-role key, which bypasses RLS.
--
-- Rollback (forward-only in production): a new migration that drops these
-- tables, the private schema and its functions, in reverse order.

-- ---------------------------------------------------------------------------
-- Private helpers (not exposed through the API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- Marked immutable so it can be used in a CHECK constraint. IANA zone names
-- are effectively stable; a removed zone only matters for new writes.
create function private.is_valid_timezone(tz text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  perform now() at time zone tz;
  return true;
exception when invalid_parameter_value then
  return false;
end;
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  slug text not null unique
    check (char_length(slug) between 3 and 63 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  template_id text not null default 'classic'
    check (template_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  languages text not null check (languages in ('en', 'ar', 'en+ar')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  package text not null default 'essential'
    check (package in ('essential', 'premium', 'bespoke')),
  starts_at timestamptz not null,
  timezone text not null default 'Europe/Vienna'
    check (private.is_valid_timezone(timezone)),
  -- Plain address used for map links; the guest-facing venue text is in content.
  venue text not null default '' check (char_length(venue) <= 300),
  rsvp_deadline timestamptz not null,
  contact_phone text not null check (contact_phone ~ '^\+[0-9][0-9 ]{6,19}$'),
  theme_settings jsonb not null default '{}'::jsonb
    check (jsonb_typeof(theme_settings) = 'object'),
  dashboard_password_hash text,
  preview_token_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvp_deadline_before_wedding check (rsvp_deadline <= starts_at)
);

comment on table public.events is 'One wedding invitation site per row.';
comment on column public.events.theme_settings is
  'Validated in the app with zod (lib/events/schema.ts): sections, schedule, mapUrl, arabicLocale, demo.';

create index events_owner_id_idx on public.events (owner_id);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function private.set_updated_at();

create table public.event_hosts (
  host text primary key
    check (char_length(host) between 3 and 253
           and host = lower(host)
           and host ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'),
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.event_hosts is
  'Maps any address (a *.vercel.app name, a custom domain) to an event. Lowercase, no port.';

create index event_hosts_event_id_idx on public.event_hosts (event_id);

create table public.content (
  event_id uuid not null references public.events (id) on delete cascade,
  key text not null
    check (char_length(key) <= 64 and key ~ '^[a-z0-9_]+(\.[a-z0-9_]+)*$'),
  text_en text check (char_length(text_en) <= 5000),
  text_ar text check (char_length(text_ar) <= 5000),
  updated_at timestamptz not null default now(),
  primary key (event_id, key)
);

comment on table public.content is
  'Couple-written text. One row per key; each language in its own column.';

create trigger content_set_updated_at
  before update on public.content
  for each row execute function private.set_updated_at();

create table public.media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  kind text not null default 'gallery' check (kind in ('hero', 'gallery')),
  url text not null check (char_length(url) <= 2048 and url ~ '^(https://|/)'),
  position integer not null check (position >= 0),
  alt_en text check (char_length(alt_en) <= 300),
  alt_ar text check (char_length(alt_ar) <= 300),
  created_at timestamptz not null default now(),
  unique (event_id, kind, position)
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120 and char_length(name) <= 120),
  guest_count integer not null check (guest_count between 1 and 20),
  attending boolean not null,
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now()
);

comment on table public.rsvps is
  'Guest replies (personal data). Never readable by the public. Deleted ~30 days after the wedding.';

create index rsvps_event_id_created_at_idx on public.rsvps (event_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Publishing requires text in every language the event shows
-- ---------------------------------------------------------------------------
create function private.content_row_is_complete(languages text, text_en text, text_ar text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select (languages = 'ar' or coalesce(btrim(text_en), '') <> '')
     and (languages = 'en' or coalesce(btrim(text_ar), '') <> '');
$$;

create function private.check_event_content_on_publish()
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

create trigger events_check_content_on_publish
  before insert or update of status, languages on public.events
  for each row execute function private.check_event_content_on_publish();

create function private.check_content_languages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_languages text;
begin
  select e.languages into event_languages
  from public.events e
  where e.id = new.event_id and e.status = 'published';

  if event_languages is not null
     and not private.content_row_is_complete(event_languages, new.text_en, new.text_ar) then
    raise exception 'content "%" is missing a language required by "%"', new.key, event_languages
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger content_check_languages
  before insert or update on public.content
  for each row execute function private.check_content_languages();

-- ---------------------------------------------------------------------------
-- Policy helpers. SECURITY DEFINER so policies can check events without the
-- caller needing column access to owner_id (which is never granted).
-- ---------------------------------------------------------------------------
create function private.event_is_published(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id and e.status = 'published'
  );
$$;

create function private.event_accepts_rsvps(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id
      and e.status = 'published'
      and now() < e.rsvp_deadline
  );
$$;

create function private.owns_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id
      and e.owner_id is not null
      and e.owner_id = (select auth.uid())
  );
$$;

revoke all on all functions in schema private from public;
grant execute on function
  private.event_is_published(uuid),
  private.event_accepts_rsvps(uuid),
  private.owns_event(uuid)
to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Privileges. Supabase grants everything on new public tables to anon and
-- authenticated by default; start from nothing and grant only what is needed.
-- ---------------------------------------------------------------------------
revoke all on public.events, public.event_hosts, public.content, public.media, public.rsvps
  from anon, authenticated;

-- Safe event columns: never the hashes or owner_id.
grant select (id, slug, template_id, languages, status, package, starts_at, timezone,
              venue, rsvp_deadline, contact_phone, theme_settings, created_at, updated_at)
  on public.events to anon, authenticated;
grant select on public.event_hosts, public.content, public.media to anon, authenticated;

-- Guests: insert only the RSVP fields (not id, created_at).
grant insert (event_id, name, guest_count, attending, notes) on public.rsvps to anon, authenticated;

-- Owner (signed-in admin). Hash columns are written only with the service role.
grant insert (owner_id, slug, template_id, languages, status, package, starts_at, timezone,
              venue, rsvp_deadline, contact_phone, theme_settings)
  on public.events to authenticated;
grant update (slug, template_id, languages, status, package, starts_at, timezone,
              venue, rsvp_deadline, contact_phone, theme_settings)
  on public.events to authenticated;
grant delete on public.events to authenticated;
grant insert, update, delete on public.event_hosts, public.content, public.media to authenticated;
grant select, delete on public.rsvps to authenticated;
grant update (name, guest_count, attending, notes) on public.rsvps to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_hosts enable row level security;
alter table public.content enable row level security;
alter table public.media enable row level security;
alter table public.rsvps enable row level security;

-- events
create policy "Published events are public"
  on public.events for select to anon, authenticated
  using (status = 'published');

create policy "Owners read their events"
  on public.events for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Owners create their events"
  on public.events for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Owners update their events"
  on public.events for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Owners delete their events"
  on public.events for delete to authenticated
  using (owner_id = (select auth.uid()));

-- event_hosts, content, media: public read when published; owners manage.
create policy "Hosts of published events are public"
  on public.event_hosts for select to anon, authenticated
  using ((select private.event_is_published(event_id)));
create policy "Owners manage their hosts"
  on public.event_hosts for all to authenticated
  using ((select private.owns_event(event_id)))
  with check ((select private.owns_event(event_id)));

create policy "Content of published events is public"
  on public.content for select to anon, authenticated
  using ((select private.event_is_published(event_id)));
create policy "Owners manage their content"
  on public.content for all to authenticated
  using ((select private.owns_event(event_id)))
  with check ((select private.owns_event(event_id)));

create policy "Media of published events is public"
  on public.media for select to anon, authenticated
  using ((select private.event_is_published(event_id)));
create policy "Owners manage their media"
  on public.media for all to authenticated
  using ((select private.owns_event(event_id)))
  with check ((select private.owns_event(event_id)));

-- rsvps: anyone may reply before the deadline; only owners read or correct.
create policy "Guests reply to open published events"
  on public.rsvps for insert to anon, authenticated
  with check ((select private.event_accepts_rsvps(event_id)));

create policy "Owners read their rsvps"
  on public.rsvps for select to authenticated
  using ((select private.owns_event(event_id)));

create policy "Owners correct their rsvps"
  on public.rsvps for update to authenticated
  using ((select private.owns_event(event_id)))
  with check ((select private.owns_event(event_id)));

create policy "Owners delete their rsvps"
  on public.rsvps for delete to authenticated
  using ((select private.owns_event(event_id)));
