-- Fictional guest replies for the demo couple, so the sample dashboard
-- (addition #5) has something real to show: a mix of attending/declining
-- and with/without notes, to demonstrate the stats, filters and search.
-- See 20261117130000_seed_demo_event.sql for the parent event/content/media
-- seed. No real guest data: CLAUDE.md's demo is "a fictional couple".
--
-- Rollback (forward-only in production): a new migration that deletes these
-- rows by event_id (slug 'layla-and-adam') and this migration's timestamp.

insert into public.rsvps (event_id, name, guest_count, attending, notes)
select e.id, r.name, r.guest_count, r.attending, r.notes
from public.events e
cross join (
  values
    ('The Haddad family', 4, true, 'One vegetarian, one vegan'),
    ('Lena Novak', 2, true, null),
    ('Marco & Giulia', 2, true, 'Arriving after dinner'),
    ('Omar Khalil', 1, false, 'Wish we could be there!'),
    ('The Fischer family', 3, true, null),
    ('Sara Ahmed', 1, true, 'Gluten-free please'),
    ('Jonas & Mira', 2, false, null),
    ('The Haddad cousins', 5, true, 'Will bring the kids')
) as r(name, guest_count, attending, notes)
where e.slug = 'layla-and-adam';
