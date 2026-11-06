# Wedding Invitations: Final Spec

Oct 11, 2026 · @Haytham

> Converted from `Wedding_Invitations_Final_Spec.pdf`. The brand name is now **Zaffa** (final), and the domain placeholder is `zaffa.com`. Marketing copy on the landing page is language-neutral; the product decisions below are unchanged.

## The product

**Title:** Bilingual Digital Wedding Invitations with RSVP

**One line:** Beautiful bilingual wedding invitations with built-in RSVP and guest management, made for couples whose families speak more than one language.

**Description:** Couples get an elegant digital wedding invitation in two languages at once, such as English and Arabic. Right-to-left scripts render properly, and both languages sit together on the page. Guests anywhere in the world open the invitation, read the couple's story, see event details and RSVP in seconds. The couple follows every reply from a private dashboard. It's built for diaspora weddings, where the invitation must feel just as natural to the grandparents as to the friends.

**Name:** Zaffa (chosen). Earlier ideas: Dua Invites, Two Tongues, Mirror Invites.

All 40 decisions below are confirmed.

## Business model

Start done-for-you, then grow into self-serve.

1. **Now: done-for-you.** The couple fills in an intake form. You enter their content into your own system, built on reusable templates and one database, and publish their page. To them it feels custom; to you each wedding takes hours, not days.
2. **Track repeated manual work.** Anything every couple asks for becomes a feature. Any form question that confuses people gets fixed.
3. **After 15–30 weddings: open self-serve.** Templates are proven, real examples exist, and the editor is your admin tool with nicer styling. Done-for-you stays as a premium tier.

This is a side project alongside the job search, so the model favors packages, limits and reuse over custom work.

## Customers and positioning

| # | Question | Decision |
|---|---|---|
| 1 | Which couples? | Couples marrying in Europe. Each couple chooses English only, Arabic only, or both. No Persian, Urdu or Turkish at launch. |
| 2 | Launch market | Europe first. |
| 3 | Who decides and pays | The couple, agreeing directly with you. |
| 4 | What they use today | Thought to be printed cards; unconfirmed. WhatsApp video invitations are likely a strong competitor in Arab communities. |
| 5 | What they dislike | Everyone does the same traditional thing, with no creativity. To be confirmed by talking to 5 couples. |

**Positioning:** lead marketing with "wedding invitations in English and Arabic, both done beautifully." Couples can still choose all English or all Arabic.

> Update (Nov 2026): public marketing is now language-neutral: "Wedding invitations in every language your families speak." No Arabic text or English/Arabic mention on the landing page.

## The offer

Three packages plus add-ons. Language choice is included in every package, since it's the main selling point.

| Package | Price | Includes |
|---|---|---|
| Essential | €250 | 1 template, language choice, hero with names and date, countdown, short story, venue and map, contact, RSVP, guest dashboard with CSV export, a color palette from the template, section order |
| Premium | €450 | Essential + schedule of the day, photo gallery (up to 20 photos), dress code, background music, opening animation, custom colors and curated fonts |
| Bespoke | from €700 | Premium + design beyond the templates, custom sections, video |

| Add-on | Price |
|---|---|
| Video section | €50 |
| Custom domain | €40 + domain cost |
| Extra section | €40 |
| Extra revision round | €30 |
| Rush delivery (3 days) | +€100 |

| # | Question | Decision |
|---|---|---|
| 6 | Base package | Essential, with the contents above. |
| 7 | Price and tiers | Essential €250, Premium €450, Bespoke from €700, plus add-ons. |
| 8 | Revisions | 2 rounds included; extra rounds are charged. |
| 9 | Delivery time | One week, starting once the couple has provided all content and paid the 50% deposit. |
| 10 | Events per site | One event. A schedule section covers the order of events on the day. |
| 11 | Live after the wedding | Until 3 months after the wedding, then archived. Ask permission to show the site to future couples, with an option to blur names and photos. |
| 12 | Extras | Video, custom domain, extra section, extra revisions, rush delivery, or anything the couple proposes. |

## Invitation page

| # | Question | Decision |
|---|---|---|
| 13 | Standard sections | Hero, story, date and countdown, venue map, schedule, gallery, dress code, RSVP, contact. |
| 14 | Languages | The couple chooses English only, Arabic only, or both. With both, they're stacked: each line in English with the Arabic directly beneath. |
| 15 | Templates at launch | 2–3. |
| 16 | Customization | Colors, curated fonts and section order. Anything beyond that is Bespoke. |
| 17 | Music, video, animation | Music or video if the couple wants it. |
| 18 | Privacy | The invitation page is public via its link. The guest dashboard is on a private route with its own strong password per wedding, kept by the couple and not forwarded to others. Later: Supabase magic-link login. |

**RTL rules:** set `dir="rtl"` and `lang="ar"` on each Arabic block, use logical CSS properties (`ms-`, `pe-`, `text-start`), and pair a good Arabic font (Amiri, Noto Naskh Arabic, Tajawal) with the Latin font. Test every template with real Arabic text.

## RSVP

| # | Question | Decision |
|---|---|---|
| 19 | Form fields | Required: name, number of guests, attending yes/no. Optional: one general notes field (meal preferences, vegan, allergies, anything else). |
| 20 | Per person or household | Per household; they enter how many people are coming. |
| 21 | Link type | One open link the couple shares as they wish. No personal links. |
| 22 | Guests changing RSVP | Guests can't. The couple can correct or remove entries in the dashboard, for duplicates, typos, changed plans and spam. |
| 23 | Deadline | The couple picks the date. After it closes, the form shows "RSVP closed" and the couple's contact number. |
| 24 | Separate RSVPs per event | No. One RSVP form, since it's one event. |

## Couple dashboard

| # | Question | Decision |
|---|---|---|
| 25 | At a glance | Households that replied, total people attending, declined, guests who left a note. No "pending": there's no guest list to compare against. |
| 26 | Search, filters, export | Search by name. Filters: attending / not attending, has a note. CSV export for the caterer. |
| 27 | Who can log in | Only the couple, with the shared password. |

## Workflow

### From inquiry to launch

1. The couple gets in touch; you agree on the package, extras and price.
2. The couple pays a 50% deposit.
3. The couple fills in the intake form and uploads photos to a shared Google Drive folder or an upload field. WhatsApp is for conversation only, since it compresses photos.
4. Texts are translated, by the couple or with an AI tool, and the couple approves the translation.
5. Once all content is in and the deposit is paid, the one-week clock starts.
6. You build on a Vercel preview link and send it after each finished section or page.
7. The couple approves; 2 revision rounds are included.
8. The couple pays the remaining 50%, and the site goes live.
9. After the wedding: CSV export offered, data deleted within ~30 days, site archived after 3 months.

### Intake form (Q28)

| Field | Required |
|---|---|
| Couple's names | Yes |
| Wedding date and time | Yes |
| Venue and address | Yes |
| Languages | Yes |
| Package | Yes |
| Template choice | Yes |
| RSVP deadline | Yes |
| Contact number shown to guests | Yes |
| Their story | No |
| Schedule of the day | No |
| Dress code | No |
| Music choice | No |
| Favorite colors | No |
| Sites they like | No |
| Anything else | No |

### Remaining workflow questions

| # | Question | Decision |
|---|---|---|
| 29 | Photos, texts, translation | Conversation on WhatsApp; photos via Google Drive or an upload field. You translate with AI and the couple approves, or they send their own translation. |
| 30 | Review before launch | Vercel preview link, shared section by section. |
| 31 | Hours per wedding | The time you spend building one wedding. Target 10–15 hours for Essential; time the first two weddings to check the prices work. |
| 32 | Admin tools | The admin is you; couples only see their dashboard. At first, edit content directly in Supabase. Later, an admin page to create events, set passwords, open or close RSVPs, and export or delete guest data. |

## Payments, refunds and guest data

| # | Question | Decision |
|---|---|---|
| 33 | Payment | After agreeing on everything: 50% upfront, 50% on delivery. |
| 34 | Refunds | The deposit is non-refundable once work starts. If the couple cancels mid-project, the deposit is kept. After delivery, no refund, but anything broken gets fixed. |
| 35 | Guest data (GDPR) | Stored on Supabase in the EU region (Frankfurt). A short privacy notice under the RSVP form. After the wedding, offer the couple a CSV export, then delete within ~30 days. |

Put deposit, revisions, live period, portfolio use and data deletion in one written agreement. A freelancer contract template is worth having checked; this isn't legal advice.

## Customers and success

| # | Question | Decision |
|---|---|---|
| 36 | Where to find couples | Instagram and TikTok (short videos of an invitation opening on a phone); Facebook groups of Arab communities in Germany, Sweden, the Netherlands and similar; bridal shops, Arab wedding planners, photographers and venues in Europe; your own network. |
| 37 | Demo | A live sample wedding page for a fictional couple, in English and Arabic, that people can open and click through. |
| 38 | Referrals | Yes, after the first couples. Ask couples themselves for referrals; planners and photographers later. |
| 39 | First-month success | At least 2 paid couples. |
| 40 | Stopping or changing | It's a side project, not a main job, so it runs at a pace that fits beside the job search. |

## Tech

### Stack

| Layer | Tool |
|---|---|
| App and invitation pages | Next.js (App Router), Tailwind CSS, Framer Motion |
| Database, auth, storage | Supabase (EU region), row-level security on |
| Hosting and previews | Vercel Pro (about $20/month), needed once clients pay; the free Hobby plan is non-commercial |
| Emails | Resend |
| Payments (self-serve stage) | Lemon Squeezy or Paddle, which handle EU VAT as merchant of record |

### Couple URLs

Every couple gets their own address, all served by the same Next.js app.

| Option | Example | Cost per couple | Use |
|---|---|---|---|
| Subdomain | `sara-and-omar.zaffa.com` | €0 | Default for every package |
| Custom domain | `saraandomar.com` | ~€10–15/year + €40 setup | Paid add-on |
| Vercel domain | `sara-and-omar.vercel.app` | €0 | Preview links during review only |

Setup:

1. Point the brand domain's nameservers to Vercel, so it can issue wildcard SSL certificates.
2. Add `zaffa.com` and `*.zaffa.com` to the Vercel project. New subdomains then work without any per-couple setup.
3. Middleware reads the host and rewrites it internally: `sara-and-omar.zaffa.com` → `/sites/sara-and-omar`. Custom domains map to a slug through the `custom_domain` column.
4. Routes: `app/sites/[slug]/page.tsx` for the invitation, `app/sites/[slug]/dashboard/page.tsx` for the guest list. Guests never see `/sites/` in the address bar.
5. For a custom domain, add it to the Vercel project (by hand at first, the Vercel API later), point its DNS to Vercel, and set `custom_domain` on the event. The agreement states who owns the domain and that it expires unless renewed.

Slugs use first names joined with "and" (`sara-and-omar`), plus the year if two couples share names. No surnames. Locally, test with `sara-and-omar.localhost:3000`, with the root domain set by an environment variable. `zaffa.com` stands in for the brand domain until it's bought.

### Data model

| Table | Columns |
|---|---|
| `events` | id, owner_id, slug, template_id, languages, status (draft/published), date, venue, rsvp_deadline, contact_phone, theme_settings, dashboard_password_hash, custom_domain |
| `content` | event_id, key (e.g. 'story', 'welcome'), text_en, text_ar |
| `media` | event_id, url, position |
| `rsvps` | event_id, name, guest_count, attending, notes, created_at |

Row-level security: anyone can insert an RSVP into a published event before its deadline; only the owner can read RSVPs or edit the event.

### Templates

Each template is a React component that receives the event data as props. Every text field holds both languages, stacked. A new template means one new component; the database stays the same.

### Build order (done-for-you version)

1. **Weeks 1–2:** Build the first template, driven entirely by data. Set up subdomain routing and render each wedding from the database.
2. **Week 3:** RSVP form with deadline handling and the private dashboard (search, filters, CSV export).
3. **Week 4:** Two more templates, music and video options, image upload.
4. **Week 5:** A demo wedding page and a simple landing page; start finding couples.

> Update (Nov 2026): the landing page is now being built first, from `docs/landing-reference.html`.

**Not yet:** couple-facing editor, payments in the app, custom domains by default, drag-and-drop, more than two languages, seating charts, a mobile app, automated WhatsApp reminders (use a "Share on WhatsApp" link instead).

## Next steps

- [ ] Confirm all decisions in this spec
- [ ] Talk to 5 Arab couples in Europe about how they did their invitations
- [ ] Build a demo wedding for a fictional couple (English + Arabic) to show future clients
- [ ] Write the agreement: deposit, revisions, live period, portfolio use, data deletion
- [ ] Build the intake form
- [ ] Start the build: weeks 1–2
