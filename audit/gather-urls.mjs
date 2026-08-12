import { readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
// On Git Bash /c/ maps to C:\ — Node needs native Windows paths
const HOME = process.env.USERPROFILE || process.env.HOME;
const CDX = join(HOME, 'Downloads', 'cdx.txt');

// ---------- helpers ----------
function normalize(raw) {
  let u;
  try { u = new URL(raw.trim()); } catch { return null; }
  // must be stairwaymortgage.com (any subdomain, http or https)
  if (!u.hostname.endsWith('stairwaymortgage.com')) return null;
  let path = decodeURIComponent(u.pathname).toLowerCase();
  // strip query + fragment
  // ensure trailing slash
  if (!path.endsWith('/')) path += '/';
  return path;
}

// ---------- junk classifiers ----------
const JUNK_PATTERNS = [
  { re: /^\/wp-content\//,   reason: 'wp-content' },
  { re: /^\/wp-includes\//,  reason: 'wp-includes' },
  { re: /^\/wp-json\//,      reason: 'wp-json' },
  { re: /^\/cdn-cgi\//,      reason: 'cdn-cgi' },
  { re: /^\/\.cloud\//,      reason: '.cloud' },
  { re: /^\/wp-admin\//,     reason: 'wp-admin' },
  { re: /\/feed\/?$/,        reason: 'feed' },
  { re: /\/comments\/feed\/?$/, reason: 'comments-feed' },
  { re: /^\/robots\.txt\/?$/,   reason: 'robots.txt' },
  { re: /^\/locations\.kml\/?$/,reason: 'locations.kml' },
  { re: /\/sitemap[^/]*\.xml\/?$/, reason: 'sitemap' },
  { re: /^\/author\//,       reason: 'author' },
  { re: /^\/cart\/?$/,       reason: 'cart' },
  { re: /^\/my-account\//,   reason: 'my-account' },
  { re: /^\/my-account\/?$/, reason: 'my-account' },
  { re: /^\/shop\//,         reason: 'shop' },
  { re: /^\/shop\/?$/,       reason: 'shop' },
  { re: /^\/product\//,      reason: 'product' },
  { re: /^\/elementor-/,     reason: 'elementor' },
  { re: /^\/0-template-headerless\//, reason: 'template' },
  { re: /^\/0-template-headerless\/?$/, reason: 'template' },
  { re: /^\/popup-page/,     reason: 'popup-page' },
];

const JUNK_EXTENSIONS = /\.(js|css|mp4|jpg|jpeg|png|avif|webp|woff2|gif|svg|zip|pdf)$/i;

function classifyJunk(path) {
  for (const p of JUNK_PATTERNS) {
    if (p.re.test(path)) return p.reason;
  }
  // file extensions (strip trailing slash first for check)
  const bare = path.replace(/\/$/, '');
  if (JUNK_EXTENSIONS.test(bare)) return 'file-extension';
  // query-param junk (already stripped, but paths that look like ?p=)
  if (path.includes('%3f') || path.includes('?')) return 'query-param';
  return null;
}

function isTag(path)      { return /^\/tag\//.test(path); }
function isCategory(path) { return /^\/category\//.test(path); }

// ---------- load sources ----------
// 1. CDX
const cdxLines = readFileSync(CDX, 'utf8').split('\n').filter(Boolean);
// 2. url-inventory.json
const inventory = JSON.parse(readFileSync(resolve(ROOT, 'url-inventory.json'), 'utf8'));
// 3. seo-map.json
const seoMap = JSON.parse(readFileSync(resolve(ROOT, 'seo-map.json'), 'utf8'));

const allRaw = new Set();

for (const line of cdxLines) {
  const p = normalize(line);
  if (p) allRaw.add(p);
}
for (const item of inventory) {
  let path = item.path;
  if (path && !path.startsWith('/')) path = '/' + path;
  if (path) {
    const n = normalize('https://stairwaymortgage.com' + path);
    if (n) allRaw.add(n);
  }
}
// seo-map: could be array or object
const seoEntries = Array.isArray(seoMap) ? seoMap : Object.values(seoMap);
for (const item of seoEntries) {
  let path = item.path || item.url;
  if (!path) continue;
  if (path.startsWith('http')) {
    const n = normalize(path);
    if (n) allRaw.add(n);
  } else {
    if (!path.startsWith('/')) path = '/' + path;
    const n = normalize('https://stairwaymortgage.com' + path);
    if (n) allRaw.add(n);
  }
}

console.log(`Total raw unique paths: ${allRaw.size}`);

// ---------- classify ----------
const excluded = [];
const tagCount = new Set();
const catCount = new Set();
const clean = [];
const junkCounts = {};

for (const path of allRaw) {
  if (isTag(path)) { tagCount.add(path); continue; }
  if (isCategory(path)) { catCount.add(path); continue; }

  const reason = classifyJunk(path);
  if (reason) {
    excluded.push(`${path}\t${reason}`);
    junkCounts[reason] = (junkCounts[reason] || 0) + 1;
    continue;
  }
  clean.push(path);
}

clean.sort();

// ---------- save ----------
writeFileSync(resolve(import.meta.dirname, 'excluded-urls.txt'),
  excluded.sort().join('\n') + '\n');
writeFileSync(resolve(import.meta.dirname, 'old-urls-clean.txt'),
  clean.join('\n') + '\n');

// ---------- summary ----------
console.log(`\n=== GATHER SUMMARY ===`);
console.log(`Total raw unique paths: ${allRaw.size}`);
console.log(`\nJunk excluded by category:`);
for (const [reason, count] of Object.entries(junkCounts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${reason}: ${count}`);
}
console.log(`  TOTAL junk: ${excluded.length}`);
console.log(`\nTag URLs (not audited individually): ${tagCount.size}`);
console.log(`Category URLs (not audited individually): ${catCount.size}`);
console.log(`\nClean page URLs to audit: ${clean.length}`);
