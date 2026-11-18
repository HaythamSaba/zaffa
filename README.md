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

Two Supabase projects, both in Frankfurt (Central EU), with the same migrations:

| Project | Role | Linked? | What may touch it |
|---|---|---|---|
| `zaffa` | **Development** | Yes (the only linked project) | Everything: `db:push`, `db:test`, `db:types`, `db:advisors`, Studio edits |
| `zaffa-prod` | **Production** (real couples and guests) | **Never** | **Only migrations**, with `npm run db:push:prod`. Never tests, never ad-hoc queries, never hand edits |

> **Never run `npm run db:test` (or any pgTAP / SQL test) against production.**
> The tests write fixtures (rolled back, but still against live data and
> policies). `db:test` refuses to run unless the linked project is
> `SUPABASE_DEV_PROJECT_REF`, and production is never linked.

One-time setup (PowerShell, in this folder):

```powershell
npx supabase login
npx supabase link --project-ref <dev-project-ref>   # development only
```

Then fill in `.env.local` (see `.env.example`; Dashboard → Project Settings → API Keys):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: the **development** project's (local dev and e2e).
- `SUPABASE_DEV_PROJECT_REF`, `SUPABASE_PROD_PROJECT_REF`: the two project refs (from the dashboard URL `/project/<ref>`; not secret).

On Vercel, the Production environment uses the **production** project's URL and keys. Preview deployments can use the development project.

| Command | Target | What it does |
|---|---|---|
| `npm run db:push` | dev (linked) | Applies new files in `supabase/migrations/` |
| `npm run db:test` | dev only | Runs the pgTAP tests in `supabase/tests/` (no Docker; every transaction rolls back) |
| `npm run db:advisors` | dev (linked) | Supabase's security and performance checks |
| `npm run db:types` | dev (linked) | Regenerates `lib/supabase/database.types.ts` |
| `npm run db:push:prod` | **prod** | Dry run: lists the migrations production is missing |
| `npm run db:push:prod -- --apply` | **prod** | Applies them, including the demo seed |

Order for a schema change: write the migration, `db:push` to dev, `db:test` until green, commit, then `db:push:prod` (dry run, then `--apply`).

Rules:
- Every schema change is a new migration file.
- Schema and data changes go in separate migrations.
- A migration that has been applied is never edited; fix forward with a new one.
- Sign-ups are off in both projects (Authentication settings). The admin account is created by hand.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
