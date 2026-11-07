// Fails when the initial JS for "/" exceeds the budget (gzip level 9).
// Reads the prerendered HTML from the last `next build`; no server needed.
// Scripts marked noModule (legacy polyfills) are skipped: modern browsers never load them.
// See docs/performance-budget.md.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 155;
const HTML_PATH = join(".next", "server", "app", "index.html");

async function main() {
  let html;
  try {
    html = await readFile(HTML_PATH, "utf8");
  } catch {
    console.error(`check-bundle: ${HTML_PATH} not found. Run "npm run build" first.`);
    process.exit(1);
  }

  const tags = [...html.matchAll(/<script[^>]+src="([^"]+)"[^>]*>/g)];
  const sources = [
    ...new Set(tags.filter((m) => !/nomodule/i.test(m[0])).map((m) => m[1])),
  ];

  const rows = await Promise.all(
    sources.map(async (src) => {
      const path = join(".next", decodeURIComponent(new URL(src, "http://x").pathname).replace(/^\/_next\//, ""));
      const bytes = await readFile(path);
      return { name: path.split(/[\\/]/).pop(), gzip: gzipSync(bytes, { level: 9 }).length };
    }),
  );

  const totalKb = rows.reduce((sum, row) => sum + row.gzip, 0) / 1024;
  for (const row of rows.sort((a, b) => b.gzip - a.gzip)) {
    console.log(`${(row.gzip / 1024).toFixed(1).padStart(7)} kB  ${row.name}`);
  }
  console.log(`Initial JS for /: ${totalKb.toFixed(1)} kB gzipped (budget ${BUDGET_KB} kB)`);

  if (totalKb > BUDGET_KB) {
    console.error(`check-bundle: over budget by ${(totalKb - BUDGET_KB).toFixed(1)} kB`);
    process.exit(1);
  }
}

await main();
