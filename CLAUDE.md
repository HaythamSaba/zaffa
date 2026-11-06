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

## Phase 1: landing page rules

### Sections, in order
1. Header
2. Hero
3. Who it's for
4. What we do (6 features)
5. How it works (5 steps)
6. Packages + add-ons
7. Demo call to action
8. About
9. FAQ (accordion)
10. Contact (form + email/WhatsApp/Instagram)
11. Footer

### Copy
- Take the copy from the reference.
- Marketing copy stays **language-neutral**: no Arabic text, and no naming of specific languages ("in every language your families speak").
- Keep placeholders like `[YOUR EMAIL]` in one `lib/site-config.ts` so they're easy to fill in.
- Never invent testimonials, stats or client logos.

### Brand
- Use only the tokens in `docs/brand.md`. No hard-coded hex values in components.
- Follow its contrast rules:
  - Coral is never text on Blush.
  - Saffron is only text on Indigo.
  - Never pair Coral and Indigo as text and background.

### Fonts
- Fraunces (headings, with `SOFT` 100, `WONK` 0) and Manrope (body), via `next/font/google`.
- Only one italic accent word per section, at most.

### Logo
- `ZMark` is an inline SVG using `currentColor`, taken from the placeholder in `docs/brand.md`.
- The wordmark is lowercase `zaffa` in Fraunces 600 until a final SVG lands in `public/brand/`.

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
- Metadata, Open Graph image (Paper wordmark on Night Indigo + Saffron dot, 1200×630), favicon (Paper Z on Coral, 22% radius), `sitemap.ts`, `robots.ts`.

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
