Zaffa: wedding invitation websites with RSVP (Next.js, Supabase, Vercel). See `CLAUDE.md` and `docs/spec.md`.

## Requirements

- **Node.js 22 (LTS) is required.** `package.json` sets `"engines": { "node": "22.x" }`, so Vercel builds and runs on Node 22 too, and npm warns on other versions. With [Volta](https://volta.sh) the project pins Node 22.23.5 automatically (`"volta"` in `package.json`); without it, install any Node 22.x.
- Copy `.env.example` to `.env.local` and fill it in.

## Getting Started

```powershell
npm install
npm run dev
```

- Marketing site: <http://localhost:3000>
- Demo invitation: <http://localhost:3000/sample>
- A couple's subdomain locally: set `ROOT_DOMAIN=localhost` in `.env.local`, then open <http://layla-and-adam.localhost:3000>

Before calling something done: `npm run verify` (lint, typecheck, unit tests, build, bundle budget) and `npm run test:e2e` (Playwright at 375 and 1280 px; uses the linked development Supabase project).

## Database (Supabase)

> **Single-project mode:** the linked Supabase project (`zaffa`, Frankfurt)
> serves both development and the live demo — it holds no real couple or
> guest data, only the fictional demo couple. `npm run db:test` and
> `npm run db:push` both target it safely for now. A separate production
> project will be created before the first paying couple; only
> `npm run db:push` will ever target it once it exists. Supabase's own
> CLI/dashboard label every project "production" by default — that's not a
> signal this is a real production database.

One-time setup (PowerShell, in this folder):

```powershell
npx supabase login
npx supabase link --project-ref <dev-project-ref>
```

Then put the dev project's URL, publishable key and secret key in `.env.local`
(see `.env.example`; Dashboard → Project Settings → API Keys).

| Command | What it does |
|---|---|
| `npm run db:push` | Applies new files in `supabase/migrations/` to the linked project |
| `npm run db:test` | Runs the pgTAP tests in `supabase/tests/` (each file rolls back) |
| `npm run db:advisors` | Supabase's security and performance checks |
| `npm run db:types` | Regenerates `lib/supabase/database.types.ts` |
| `npm run password:set -- <slug> [password]` | Sets/resets a couple's dashboard password (generates a strong one and prints it once if omitted; a custom one must be ≥12 characters) |

Rules: every schema change is a new migration file; schema and data changes
go in separate migrations; a migration that has been applied is never edited.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
