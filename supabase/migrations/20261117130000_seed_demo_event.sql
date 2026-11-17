-- Data migration: the published demo couple shown at /sample.
-- Layla & Adam, Villa Rosa and the phone number are fictional sample data
-- (docs/templates/classic-reference.html). Kept separate from the schema
-- migration. Idempotent: re-running changes nothing.
-- Photos are the landing page's licensed images (public/images/README.md).

insert into public.events
  (id, slug, template_id, languages, status, package, starts_at, timezone, venue,
   rsvp_deadline, contact_phone, theme_settings)
values (
  'de000000-0000-4000-8000-000000000001',
  'layla-and-adam',
  'classic',
  'en+ar',
  'draft',
  'premium',
  '2027-06-12 18:00:00 Europe/Vienna',
  'Europe/Vienna',
  'Rosengasse 12, 1010 Vienna',
  '2027-05-01 23:59:59 Europe/Vienna',
  '+43 660 000 0000',
  jsonb_build_object(
    'demo', true,
    'arabicLocale', 'ar-EG',
    'schedule', jsonb_build_array(
      jsonb_build_object('id', 'welcome_drinks', 'time', '18:00'),
      jsonb_build_object('id', 'zaffa', 'time', '18:30'),
      jsonb_build_object('id', 'dinner', 'time', '19:30'),
      jsonb_build_object('id', 'dancing', 'time', '21:00')
    )
  )
)
on conflict (id) do nothing;

insert into public.content (event_id, key, text_en, text_ar)
values
  ('de000000-0000-4000-8000-000000000001', 'names', 'Layla & Adam', 'ليلى وآدم'),
  ('de000000-0000-4000-8000-000000000001', 'place', 'Vienna, Austria', 'فيينا، النمسا'),
  ('de000000-0000-4000-8000-000000000001', 'welcome.hosts',
   'Together with their families', 'بحضور عائلتيهما الكريمتين'),
  ('de000000-0000-4000-8000-000000000001', 'welcome.message',
   'joyfully invite you to celebrate their wedding', 'يتشرّفان بدعوتكم لمشاركتهما فرحة زفافهما'),
  ('de000000-0000-4000-8000-000000000001', 'story',
   'We met at a friend''s dinner in Vienna and haven''t stopped talking since. Three years, two cities and countless cups of tea later, we''re making it forever.',
   'التقينا على عشاء عند صديق في فيينا، ومنذ ذلك اليوم لم نتوقف عن الحديث. بعد ثلاث سنوات ومدينتين وأكواب شاي لا تُحصى، قرّرنا أن نكمل الطريق معاً إلى الأبد.'),
  ('de000000-0000-4000-8000-000000000001', 'venue.name', 'Villa Rosa', 'فيلا روزا'),
  ('de000000-0000-4000-8000-000000000001', 'schedule.welcome_drinks.title', 'Welcome drinks', 'الاستقبال'),
  ('de000000-0000-4000-8000-000000000001', 'schedule.zaffa.title', 'The zaffa & ceremony', 'الزفّة والمراسم'),
  ('de000000-0000-4000-8000-000000000001', 'schedule.dinner.title', 'Dinner', 'العشاء'),
  ('de000000-0000-4000-8000-000000000001', 'schedule.dancing.title', 'Music & dancing', 'الموسيقى والرقص'),
  ('de000000-0000-4000-8000-000000000001', 'dress_code',
   'Formal attire · soft, light colours welcome', 'لباس رسمي · نرحّب بالألوان الهادئة الفاتحة'),
  ('de000000-0000-4000-8000-000000000001', 'contact.name', 'Layla', 'ليلى')
on conflict (event_id, key) do nothing;

insert into public.media (event_id, kind, url, position, alt_en, alt_ar)
values
  ('de000000-0000-4000-8000-000000000001', 'hero', '/images/countdown.png', 0,
   'A bride and groom kissing behind a white balloon in warm evening light',
   'عروسان يتبادلان قبلة خلف بالون أبيض في ضوء المساء الدافئ'),
  ('de000000-0000-4000-8000-000000000001', 'gallery', '/images/story.png', 0,
   'A bouquet of cream and pink roses held above a hand wearing a wedding ring',
   'باقة من الورود الكريمية والوردية فوق يد تلبس خاتم الزواج'),
  ('de000000-0000-4000-8000-000000000001', 'gallery', '/images/venue.png', 1,
   'A white domed gazebo with flowers at the end of a rose-petal aisle',
   'قبّة بيضاء مزيّنة بالزهور في نهاية ممرّ من بتلات الورد'),
  ('de000000-0000-4000-8000-000000000001', 'gallery', '/images/faq-table.png', 2,
   'A wedding table set with pink roses, tall white candles and glassware',
   'طاولة زفاف مزيّنة بالورود الوردية والشموع البيضاء الطويلة'),
  ('de000000-0000-4000-8000-000000000001', 'gallery', '/images/phone-couple.png', 3,
   'A couple''s hands with wedding rings resting on a bouquet of peach roses',
   'يدا عروسين بخاتمي الزواج على باقة من الورود الخوخية')
on conflict (event_id, kind, position) do nothing;

-- Publish last, so the publish check sees the complete content.
update public.events
set status = 'published'
where id = 'de000000-0000-4000-8000-000000000001' and status = 'draft';
