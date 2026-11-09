# CLAUDE.md: Zaffa

Zaffa makes elegant digital wedding invitation websites with built-in RSVP and a private guest dashboard. Invitations can show more than one language together on the same page.

## Read these first
- `docs/spec.md`: the full product spec. Its 40 numbered decisions are confirmed. Don't reopen them; ask if something seems to conflict.
- `docs/brand.md`: the company brand (fonts, colors, logo, Tailwind tokens, contrast rules).
- `docs/landing-reference.html`: the approved landing page design. Use it as a **visual reference only**. Rebuild it as clean Next.js components, never paste its inline-styled HTML.

## Current phase
**Phase 1: marketing landing page** at the root domain. The invitation product (phase 2+) follows the spec's build order afterwards. Don't build phase 2 features until asked.

## Stack
- Next.js (App Router) + TypeScript, Tailwind CSS (v4, tokens in `@theme`), Framer Motion
- Supabase in the EU region (Frankfurt) for the database, storage, and row-level security. Phase 2; not needed for the landing page.
- Vercel for hosting and preview links; Resend for email
- Not yet: payments, a couple-facing editor, custom domains by default, more than 2 languages per invitation, seating, automated WhatsApp messages
- Dev machine: Windows + PowerShell. Use cross-platform npm scripts. No bash-only commands in `package.json`.

## Folder layout
- `app/(marketing)/page.tsx`: landing page at the root domain
- `app/(marketing)/privacy`, `terms`, `legal`: legal pages, linked from the footer
- `app/sites/[slug]/page.tsx`: a couple's invitation (phase 2)
- `app/sites/[slug]/dashboard/page.tsx`: the couple's guest list (phase 2)
- `components/marketing/`: one component per landing section
- `components/brand/`: `Logo`, `ZMark`
- `templates/<id>/`: invitation templates (phase 2)
- `lib/`: Supabase clients, validation, utilities
- `public/brand/`: logo files
- `public/images/`: licensed photos (see `public/images/README.md`); `lib/photos.ts` maps each photo slot to its file

## Phase 1: landing page rules

### Sections, in order
1. Header over the hero photo (nav split around the centred logo; below 900px only the logo and a small "Contact" link)
2. Hero (full-bleed photo, dark overlay, curved bottom edge)
3. Intro statement with the founder's signature (`#about`)
4. What guests receive: arch photo cards + RSVP card (`#features`)
5. Sample invitation on a phone (`#demo`)
6. Guest dashboard preview, labelled as sample data (`#dashboard`)
7. How it works, 5 steps (`#how`)
8. Packages + add-ons, arch cards (`#packages`)
9. FAQ, 6 questions, accordion (`#faq`)
10. Closing call to action on a photo band (curved top edge)
11. Contact form + email/WhatsApp/Instagram (`#contact`, the target of every "Request your invitation" button)
12. Footer

### Copy
- Take the copy from the reference.
- Marketing copy stays **language-neutral**: no Arabic text, and no naming of specific languages ("in every language your families speak").
- Keep placeholders like `[YOUR EMAIL]` in one `lib/site-config.ts` so they're easy to fill in.
- Never invent testimonials, stats or client logos.

### Brand: "Linen & Arches"
- Use only the tokens in `docs/brand.md` (Ivory, Sand, Cocoa, Taupe, Mocha, Linen, Stone, Espresso, White, and Rosewood for form errors only). No hard-coded hex values in components. Direction A ("Procession": coral, indigo, saffron, Fraunces, Manrope) is retired.
- Follow its contrast rules:
  - Mocha is never text on Sand; use Taupe.
  - Stone and Linen are for lines and borders only, never text.
  - White text on a photo always sits on the Espresso overlay.
  - Rosewood is only for form error text, the error icon and the invalid-field border, always with a written message.
- Shapes: arches (`--radius-arch`) for feature photo cards and package cards; curved section edges on the hero and closing band (no layout shift); framed photos (10px white frame + `--shadow-frame`); fine botanical line drawings used sparingly; square buttons, at least 48px tall.

### Fonts
- Cormorant Garamond (display/headings) and Montserrat (body/UI), via `next/font/google`.
- Headings are uppercase, weight 400, tracking +0.06em, with the key words in 700 (`<b>`). Italic only for small accents (a signature, "in about one week", the "&" in names).
- Labels, nav and buttons: Montserrat 600, uppercase, +0.16–0.18em, 11–12px.
- Uppercase and letter-spacing apply to Latin, Cyrillic and Greek only; never to Arabic, Hebrew or other scripts.

### Logo
- `ZMark` is an inline SVG using `currentColor`, taken from `docs/brand.md` (stroke widths 3 / 2.5 / 2).
- The wordmark is `ZAFFA` in Cormorant Garamond 500, uppercase, tracking +0.32em: Cocoa on light, White on photos.

### Photos
- One reusable `Photo` component built on `next/image` (`getImageProps`, so no client JS). Until a real file exists in `public/images/`, it shows a labelled placeholder.
- Warm, natural-light photos where hands, tables and details matter more than faces. Licensed images only (or clients' photos with written permission).

### Layout and motion
- Mobile first. Most visitors arrive from Instagram, TikTok or WhatsApp on a phone. It must look right at 375px.
- Motion: subtle Framer Motion reveals only. Respect `prefers-reduced-motion`. No layout shift.

### Contact form
- A server action that emails the inquiry via Resend.
- Validate on the server (zod).
- Add a honeypot field and rate limiting.
- Show a clear success/error state.
- Never expose API keys to the client.

### SEO
- Metadata, Open Graph image (Ivory `ZAFFA` wordmark centred on Taupe with a small Ivory botanical sprig above it, 1200×630), favicon and apple icon (Ivory Z on Taupe, 22% radius), `sitemap.ts`, `robots.ts`.

### Accessibility
- Real buttons and links.
- Labelled inputs.
- Visible focus rings.
- 44px minimum touch targets.
- One `h1`.
- `details/summary` or an accessible accordion for the FAQ.

### Legal
- Footer links to a privacy notice, terms and a legal notice (EU requirement). Draft pages are fine; mark them as drafts.

## Phase 2+: invitation product (from the spec)

### Routing
- `sara-and-omar.<ROOT_DOMAIN>` is rewritten internally to `/sites/sara-and-omar`. `ROOT_DOMAIN` comes from an env var.
- The bare root domain and `www` serve the marketing site.
- Do the rewrite in `proxy.ts` (Next.js 16+) or `middleware.ts` (older).
- Custom domains map to a slug via `events.custom_domain`.
- Guests never see `/sites/` in the URL. Test locally with `sara-and-omar.localhost:3000`.
- Slugs are first names joined with "and", plus the year if two couples share names. Never surnames.

### Data model
- `events`: id, owner_id, slug, template_id, languages, status (draft or published), date, venue, rsvp_deadline, contact_phone, theme_settings, dashboard_password_hash, custom_domain
- `content`: event_id, key, text_en, text_ar
- `media`: event_id, url, position
- `rsvps`: event_id, name, guest_count, attending, notes, created_at

Write every schema change as a migration file. Never change the database by hand once real couples exist.

### Security rules (must hold)
- RLS is on for every table.
- The public can read only published events and their content and media.
- The public can insert an RSVP only for a published event before its `rsvp_deadline`. Validate in the database: `guest_count` between 1 and a sensible max, length limits on name and notes.
- The public can never read `rsvps`.
- The couple's dashboard password is not a Supabase user, so RLS can't check it.
  - Verify it server-side against `dashboard_password_hash` (argon2 or bcrypt).
  - Then set a signed, httpOnly, per-event session cookie.
  - Read and edit RSVPs only in server code with the service-role key.
  - Never expose that key to the client.
- Rate-limit dashboard login attempts and RSVP submissions. Add a honeypot field to the RSVP form.
- Draft events are viewable only with a preview token in the URL, for the Vercel review links.
- Guest data is personal data under GDPR:
  - Show a short privacy notice under the RSVP form.
  - Provide CSV export.
  - Delete RSVPs about 30 days after the wedding with a scheduled job.
  - Archive the site 3 months after the wedding.

### Invitation languages and RTL
These apply inside invitations; the marketing site stays language-neutral.

- `languages` is `en`, `ar`, or `en+ar`. With both, the text is stacked: each English line with the Arabic directly beneath it. No language toggle.
- Every Arabic block gets `dir="rtl" lang="ar"`. For Arabic-only sites, set them on `<html>`.
- Use logical CSS only (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`). Never `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, or `text-right`. This applies everywhere, including the marketing site.
- Arabic fonts per `docs/brand.md`: Amiri for display, Noto Naskh Arabic for reading text, Readex Pro for UI.
- Fixed interface text lives in `locales/en.json` and `locales/ar.json`; couple content lives in the database.
- Test every template with real Arabic text.

### Templates
- Each template is a React component in `templates/<id>/` that receives the event data as props. Adding a template must not need a database change.
- The sections are hero, story, date and countdown, venue map, schedule, gallery, dress code, RSVP, and contact. Each is optional and orderable via `theme_settings`.
- Package gating: Essential excludes schedule, gallery, dress code, music, opening animation, and custom colors.
- Music starts only after a guest taps something, such as the opening animation. Browsers block autoplay.
- Each invitation needs a good WhatsApp link preview (Open Graph metadata).

### RSVP
- Required fields: name, number of guests, attending yes/no. Optional: one notes field.
- One RSVP per household. One open link per wedding. Guests can't edit their RSVP.
- After the deadline, the form shows "RSVP closed" and the couple's contact number.

### Dashboard
- Summary: households that replied, total attending, declined, and replies with notes.
- Search by name. Filters: attending, not attending, has a note. CSV export.
- The couple can edit or delete entries.

## Working style
- Plan first (`/plan`), and wait for approval before large changes.
- Keep each change small and commit after each verified step.
- Write tests first for logic:
  - contact form validation
  - RSVP form and deadline logic
  - the password and session flow
  - RLS policies
- Write Playwright end-to-end tests for the main flows.
- Before calling something done, run the build, type check, lint and tests (`verification-loop`), and check the page at 375px and 1280px.
- Never commit secrets. Keep them in `.env.local`, and list the variable names in `.env.example`.
