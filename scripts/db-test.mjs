// Runs the pgTAP tests in supabase/tests/ against the linked DEVELOPMENT
// Supabase project, without Docker (`supabase test db` runs pg_prove in a
// container). Each file runs through `supabase db query --remote`, which only
// returns the last statement's rows, so every top-level pgTAP call is turned
// into `insert into tap_out select ...` and the TAP lines are read back at
// the end. The final `rollback` is dropped: the transaction stays open and the
// server rolls it back when the CLI disconnects (verified: nothing persists).
//
// Usage: npm run db:test            (all files)
//        npm run db:test -- rls     (files whose name contains "rls")
// Never point this at a production project (see README).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEST_DIR = join("supabase", "tests");
const FINISH = /select\s+\*\s+from\s+finish\(\)\s*;\s*rollback\s*;\s*$/i;
const BEGIN = /^begin;\s*$/m;
const ASSERTION = /^select\s+(plan|ok|is|isnt|throws_ok|lives_ok|results_eq|is_empty|isnt_empty)\(/gm;
// The tests switch to anon/authenticated, so the sink is open to every role.
const SINK = `begin;
create temp table tap_out (n serial primary key, line text);
grant all on tap_out to public;
grant all on sequence tap_out_n_seq to public;`;
const RESULTS = "\nselect string_agg(line, E'\\n' order by n) as tap from tap_out;";

/** Turns a pgTAP file into one batch whose last statement returns all TAP output. */
function instrument(sql, file) {
  if (!FINISH.test(sql)) throw new Error(`${file}: must end with "select * from finish(); rollback;"`);
  if (!BEGIN.test(sql)) throw new Error(`${file}: must contain a "begin;" line`);
  return sql
    .replace(BEGIN, SINK)
    .replace(ASSERTION, (_match, name) => `insert into tap_out (line) select ${name}(`)
    .replace(FINISH, RESULTS);
}

/** Parses TAP ("1..12", "ok 1 - ...", "not ok 2 - ...") into a summary. */
function parseTap(tap) {
  const lines = (tap ?? "").split("\n");
  const planned = Number(/^1\.\.(\d+)/m.exec(tap ?? "")?.[1] ?? 0);
  const results = lines.filter((line) => /^(not )?ok \d+/.test(line));
  const failures = results.filter((line) => line.startsWith("not ok"));
  const diagnostics = lines.filter((line) => line.startsWith("#"));
  return { planned, ran: results.length, failures, diagnostics };
}

function runFile(file, workDir) {
  const sql = readFileSync(join(TEST_DIR, file), "utf8").trimEnd();
  const wrapped = join(workDir, file);
  writeFileSync(wrapped, instrument(sql, file));

  const output = execFileSync(
    "npx",
    ["supabase", "db", "query", "--remote", "--yes", "--output-format", "json", "-f", wrapped],
    { encoding: "utf8", shell: process.platform === "win32", stdio: ["ignore", "pipe", "pipe"] },
  );
  const json = JSON.parse(output.slice(output.indexOf("{")));
  if (json.error) throw new Error(`${file}: ${json.error.message ?? JSON.stringify(json.error)}`);
  return parseTap(json.rows?.[0]?.tap);
}

const filter = process.argv[2] ?? "";
const files = readdirSync(TEST_DIR).filter((f) => f.endsWith(".test.sql") && f.includes(filter)).sort();
const workDir = mkdtempSync(join(tmpdir(), "zaffa-db-test-"));
let failed = 0;
let total = 0;

try {
  for (const file of files) {
    let summary;
    try {
      summary = runFile(file, workDir);
    } catch (error) {
      failed += 1;
      const detail = String(error?.stdout || error?.message || error);
      console.error(`✗ ${file}: ${detail.split("\n").find((line) => line.includes("rror")) ?? detail.split("\n")[0]}`);
      continue;
    }
    const { planned, ran, failures, diagnostics } = summary;
    total += ran;
    for (const line of failures) console.error(`  ${line}`);
    if (failures.length > 0) for (const line of diagnostics) console.error(`  ${line}`);
    if (ran !== planned) console.error(`  planned ${planned} tests but ran ${ran}`);
    const passed = failures.length === 0 && ran === planned && planned > 0;
    if (!passed) failed += 1;
    console.log(`${passed ? "✓" : "✗"} ${file}: ${ran - failures.length}/${planned}`);
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`\n${total} tests in ${files.length} files, ${failed} file(s) failing`);
process.exit(failed === 0 && files.length > 0 ? 0 : 1);
