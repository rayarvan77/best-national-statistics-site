// NusaStat entrypoint (Node 22, standard library only).
//
// The site is plain static files under app/ — index.html plus the scripts,
// styles and data it loads, with no build step and no network requests.
// This program hands the site in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there,
// using the vendored make.fun library (vendor/makefun-frontend.ts), which
// must stay exactly as the kit shipped it.
//
// In the grader the output directory is /output. Anywhere else, set
// MAKEFUN_OUTPUT_DIR to choose it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outDir, { recursive: true });

// Fail loudly instead of handing in an empty site if app/index.html is missing.
if (!existsSync(join(repoRoot, "app", "index.html"))) {
  throw new Error("app/index.html is missing; nothing to hand in");
}
cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });

const shotsDir = join(repoRoot, "screenshots");
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });
}

// Caps mirror the scorer's gate: at most 4 screenshots of 256 KiB each,
// app/ at most 993 files and 16 MiB, dossier text at most 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);

console.log("wrote dossier.json for NusaStat");
