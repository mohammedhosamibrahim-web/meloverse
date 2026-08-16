/**
 * build.js — static build for Cloudflare Pages / any static host.
 * Copies the frontend (public/) into a deployable dist folder.
 * NOTE: this is the UI only. The backend (server.js) cannot run on static hosting,
 * so API features (lists, reader, comments, admin) require the backend elsewhere.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'public');
const OUT = path.join(__dirname, '..', 'meloverse-dist');

const EXCLUDE_DIRS = new Set(['uploads']); // backend data, not part of the static UI

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.isDirectory() && EXCLUDE_DIRS.has(entry.name)) continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
copyDir(SRC, OUT);

const indexPath = path.join(OUT, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('BUILD FAILED: index.html missing');
  process.exit(1);
}

const size = fs.statSync(indexPath).size;
console.log(`BUILD OK -> ${OUT}`);
console.log(`  index.html: ${size} bytes`);
const files = fs.readdirSync(OUT);
console.log('  files:', files.join(', '));
