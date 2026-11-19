// LEONIDA LEDGER — GTA VI trophy guide entry (Node 22, standard library only).
// The guide is this directory's app/: plain static files, no build step, served
// with app/ at the root (try `node serve.ts`, then open http://localhost:8080).
// app/index.html + app.js + style.css render the checklist, roadmap and watchlist;
// app/data/trophies.json holds all 55 official trophies with own-words cited guides.
// The app loads nothing over the network at run time.
//
// This program hands the entry in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json with the vendored make.fun
// library (vendor/makefun-frontend.ts, unchanged — the scorer requires dossier.json
// to be byte for byte what its own copy of that library writes).
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program is deterministic: two runs write the same bytes.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the guide (app/) and its screenshots into the output directory.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Refuse to hand in a half-built entry: the guide must name all 55 trophies
// and carry 3 or 4 screenshots within the scorer's caps, checked here first.
const trophies = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8')).trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`expected 55 trophies in app/data/trophies.json, found ${trophies?.length ?? 0}`);
}
const shots = readdirSync(join(here, 'screenshots')).filter((f) => !f.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const shot of shots) {
  if (statSync(join(here, 'screenshots', shot)).size > 262144) {
    throw new Error(`screenshot ${shot} is over the 256 KiB cap`);
  }
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse
// an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files and directories in app/ or 48 MiB of app files, which count
// beside /output's own 1000-entry cap with screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
