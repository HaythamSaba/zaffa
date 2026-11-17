This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Supabase)

> **The linked Supabase project (`zaffa`, Frankfurt) is DEVELOPMENT only.**
> Database tests (`npm run db:test`) must never run against a production
> project. Production will be a separate Supabase project in Frankfurt
> (Central EU), created before the first paying couple; only `npm run db:push`
> (migrations) ever targets it, never tests and never hand edits.

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
