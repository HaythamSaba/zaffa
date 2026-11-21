// Sets or resets a couple's dashboard password, since there's no admin page
// yet. Hashes locally with bcryptjs, then runs the UPDATE through
// `supabase db query --remote` against the linked project (see db-test.mjs
// for the same approach), so no Supabase credentials need to be wired into
// this plain Node script.
//
// Usage: npm run password:set -- <slug> [password]
//   - With no password: generates a strong random one and prints it ONCE.
//   - A custom password must be at least 12 characters.
import { randomInt } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";

export const GENERATED_PASSWORD_LENGTH = 20;
export const MIN_CUSTOM_PASSWORD_LENGTH = 12;
const BCRYPT_COST = 12;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// No 0/O or 1/l/I: generated passwords are meant to be read and retyped once.
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generatePassword(length = GENERATED_PASSWORD_LENGTH) {
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  }
  return password;
}

export function validateCustomPassword(password) {
  if (password.length === 0) return { ok: false, reason: "Password cannot be blank." };
  if (password.length < MIN_CUSTOM_PASSWORD_LENGTH) {
    return { ok: false, reason: `Custom password must be at least ${MIN_CUSTOM_PASSWORD_LENGTH} characters.` };
  }
  return { ok: true };
}

function isValidSlug(slug) {
  return typeof slug === "string" && slug.length >= 3 && slug.length <= 63 && SLUG_PATTERN.test(slug);
}

/** Minimal, safe SQL string literal: both inputs here are a bcrypt hash and a validated slug. */
function quoteLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runUpdate(slug, hash) {
  const sql = `update public.events set dashboard_password_hash = ${quoteLiteral(hash)} where slug = ${quoteLiteral(slug)} returning slug;\n`;
  const workDir = mkdtempSync(join(tmpdir(), "zaffa-password-set-"));
  const file = join(workDir, "set-password.sql");
  writeFileSync(file, sql);

  try {
    const output = execFileSync(
      "npx",
      ["supabase", "db", "query", "--remote", "--yes", "--output-format", "json", "-f", file],
      { encoding: "utf8", shell: process.platform === "win32" },
    );
    const json = JSON.parse(output.slice(output.indexOf("{")));
    if (json.error) throw new Error(json.error.message ?? JSON.stringify(json.error));
    return json.rows ?? [];
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

async function main() {
  const [slug, passwordArg] = process.argv.slice(2);

  if (!isValidSlug(slug)) {
    console.error("Usage: npm run password:set -- <slug> [password]");
    console.error(slug ? `"${slug}" is not a valid event slug.` : "A slug is required.");
    process.exitCode = 1;
    return;
  }

  let password = passwordArg;
  let generated = false;
  if (password === undefined) {
    password = generatePassword();
    generated = true;
  } else {
    const validation = validateCustomPassword(password);
    if (!validation.ok) {
      console.error(validation.reason);
      process.exitCode = 1;
      return;
    }
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);
  const rows = runUpdate(slug, hash);

  if (rows.length === 0) {
    console.error(`No event found with slug "${slug}". Nothing was changed.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Dashboard password set for "${slug}".`);
  if (generated) {
    console.log("");
    console.log(`  ${password}`);
    console.log("");
    console.log("This is shown once and not stored anywhere else. Save it now.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}
