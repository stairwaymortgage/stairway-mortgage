import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';

const DIR = import.meta.dirname;
const ROOT = resolve(DIR, '..');
const DOMAIN = 'https://www.stairwaymortgage.com';
const MAX_CONCURRENT = 5;
const DELAY_MS = 100;
const MAX_REDIRECTS = 10;

// ---------- scan new routes ----------
function getNewRoutes() {
  const routes = new Set();

  // 1. Astro pages
  const pagesDir = resolve(ROOT, 'src/pages');
  const astroFiles = execSync(`find "${pagesDir}" -name "*.astro" -type f`, { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);

  for (const f of astroFiles) {
    let rel = f.replace(pagesDir, '').replace(/\\/g, '/');
    if (rel.startsWith('/api/')) continue;
    rel = rel.replace(/\/index\.astro$/, '/');
    rel = rel.replace(/\.astro$/, '/');
    rel = rel.toLowerCase();
    if (rel.includes('[')) {
      routes.add(rel + ' [DYNAMIC]');
    } else {
      routes.add(rel);
    }
  }

  // 2. Blog content .md files
  const blogDir = resolve(ROOT, 'src/content/blog');
  try {
    const mdFiles = execSync(`find "${blogDir}" -name "*.md" -type f`, { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
    for (const f of mdFiles) {
      const slug = f.replace(blogDir, '').replace(/\\/g, '/').replace(/^\//, '').replace(/\.md$/, '');
      routes.add(`/blog/${slug}/`);
    }
  } catch { /* no blog dir */ }

  return routes;
}

const newRoutes = getNewRoutes();
const routesList = [...newRoutes].sort();
writeFileSync(resolve(DIR, 'new-routes.txt'), routesList.join('\n') + '\n');
console.log(`New routes found: ${routesList.length}`);

// ---------- check live status ----------
const cleanUrls = readFileSync(resolve(DIR, 'old-urls-clean.txt'), 'utf8')
  .split('\n').filter(Boolean);

console.log(`URLs to check: ${cleanUrls.length}`);

async function followRedirects(url, maxHops = MAX_REDIRECTS) {
  const chain = [];
  let current = url;
  let status = 0;

  for (let i = 0; i < maxHops; i++) {
    try {
      let resp = await fetch(current, { method: 'HEAD', redirect: 'manual' });
      status = resp.status;

      if (status === 405) {
        resp = await fetch(current, { method: 'GET', redirect: 'manual' });
        status = resp.status;
      }

      if ([301, 302, 303, 307, 308].includes(status)) {
        const loc = resp.headers.get('location');
        if (loc) {
          chain.push(`${status}:${current}`);
          current = loc.startsWith('http') ? loc : new URL(loc, current).href;
          continue;
        }
      }

      return { status, finalUrl: current, chain };
    } catch (e) {
      return { status: 0, finalUrl: current, chain, error: e.message };
    }
  }
  return { status, finalUrl: current, chain };
}

const results = [];
let completed = 0;
const total = cleanUrls.length;

async function processUrl(path) {
  const url = DOMAIN + path;
  const r = await followRedirects(url);
  completed++;
  if (completed % 50 === 0) console.log(`  ${completed}/${total}...`);
  return {
    old_path: path,
    status_code: r.status,
    final_url: r.finalUrl,
    redirect_chain: r.chain.join(' -> ') || ''
  };
}

// Throttled parallel execution
async function runAll() {
  const queue = [...cleanUrls];
  const active = [];

  while (queue.length > 0 || active.length > 0) {
    while (active.length < MAX_CONCURRENT && queue.length > 0) {
      const path = queue.shift();
      const p = processUrl(path).then(r => {
        results.push(r);
        active.splice(active.indexOf(p), 1);
      });
      active.push(p);
      if (queue.length > 0) await new Promise(r => setTimeout(r, DELAY_MS));
    }
    if (active.length > 0) await Promise.race(active);
  }
}

await runAll();

results.sort((a, b) => a.old_path.localeCompare(b.old_path));

// Write CSV
const csv = ['old_path,status_code,final_url,redirect_chain'];
for (const r of results) {
  const chain = r.redirect_chain.replace(/"/g, '""');
  const furl = r.final_url.replace(/"/g, '""');
  csv.push(`"${r.old_path}",${r.status_code},"${furl}","${chain}"`);
}
writeFileSync(resolve(DIR, 'live-status.csv'), csv.join('\n') + '\n');

// Summary
const statusCounts = {};
for (const r of results) {
  statusCounts[r.status_code] = (statusCounts[r.status_code] || 0) + 1;
}
console.log(`\n=== LIVE STATUS SUMMARY ===`);
console.log(`Total checked: ${results.length}`);
for (const [code, count] of Object.entries(statusCounts).sort()) {
  console.log(`  ${code}: ${count}`);
}
