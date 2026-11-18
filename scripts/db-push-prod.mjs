// Pushes the migrations in supabase/migrations/ to the PRODUCTION Supabase
// project (zaffa-prod), which is never linked and never tested.
//
//   npm run db:push:prod              dry run: lists what would be applied
//   npm run db:push:prod -- --apply   applies it
//
// The prod ref comes from SUPABASE_PROD_PROJECT_REF (.env.local) and must
// differ from SUPABASE_DEV_PROJECT_REF. Nothing else (tests, queries, types)
// ever targets production; see README "Supabase projects".
import { execFileSync } from "node:child_process";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: rely on the environment.
}

const prod = process.env.SUPABASE_PROD_PROJECT_REF?.trim();
const dev = process.env.SUPABASE_DEV_PROJECT_REF?.trim();
const apply = process.argv.includes("--apply");

function refuse(reason) {
  console.error(`db:push:prod refused: ${reason}.`);
  process.exit(1);
}

if (!prod) refuse("SUPABASE_PROD_PROJECT_REF is not set in .env.local");
if (!/^[a-z0-9]{20}$/.test(prod)) refuse(`"${prod}" doesn't look like a Supabase project ref`);
if (dev && prod === dev) refuse("SUPABASE_PROD_PROJECT_REF equals SUPABASE_DEV_PROJECT_REF");

const args = ["supabase", "db", "push", `--remote=${prod}`, "--yes", ...(apply ? [] : ["--dry-run"])];
console.log(`${apply ? "Applying" : "Dry run:"} migrations on PRODUCTION project ${prod}\n`);
execFileSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
if (!apply) console.log("\nNothing was changed. Run `npm run db:push:prod -- --apply` to apply.");
