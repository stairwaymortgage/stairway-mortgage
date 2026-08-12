// validate-redirects.mjs — chain-check, conflict-check, loop-check
import { readFileSync, writeFileSync } from 'fs';

const proposed = JSON.parse(readFileSync('audit/redirects-proposed.json', 'utf8'));
const existing = JSON.parse(readFileSync('vercel.json', 'utf8')).redirects || [];

// 1a — Collect unique destinations to check
const dests = [...new Set(proposed.filter(r => !r.destination.includes(':')).map(r => r.destination))];
console.log(`Checking ${dests.length} unique destinations against live site...`);

// 1b — Chain check destinations
const results = [];
const CONCURRENCY = 5;
let idx = 0;

async function checkOne(url) {
  const full = `https://www.stairwaymortgage.com${url}`;
  try {
    const res = await fetch(full, { method: 'HEAD', redirect: 'follow' });
    return { url, status: res.status, final: new URL(res.url).pathname };
  } catch (e) {
    try {
      const res = await fetch(full, { method: 'GET', redirect: 'follow' });
      return { url, status: res.status, final: new URL(res.url).pathname };
    } catch (e2) {
      return { url, status: 0, final: '', error: e2.message };
    }
  }
}

async function run() {
  const queue = [...dests];
  const active = [];
  const results = [];

  while (queue.length > 0 || active.length > 0) {
    while (active.length < CONCURRENCY && queue.length > 0) {
      const url = queue.shift();
      const p = checkOne(url).then(r => {
        results.push(r);
        active.splice(active.indexOf(p), 1);
      });
      active.push(p);
      await new Promise(r => setTimeout(r, 80));
    }
    if (active.length > 0) await Promise.race(active);
  }
  return results;
}

const destResults = await run();

// Find bad destinations
const bad = destResults.filter(r => r.status !== 200);
const redirected = destResults.filter(r => r.status === 200 && r.final !== r.url && r.final !== r.url.replace(/\/$/, ''));
console.log(`\n--- Destination Check ---`);
console.log(`200 OK: ${destResults.filter(r => r.status === 200).length}`);
console.log(`Non-200: ${bad.length}`);
if (bad.length) bad.forEach(b => console.log(`  ${b.status} ${b.url} ${b.error || ''}`));
console.log(`Redirected (final != dest): ${redirected.length}`);
if (redirected.length) redirected.forEach(r => console.log(`  ${r.url} -> ${r.final}`));

// Fix proposed: update destinations that redirected, drop destinations that 404
const fixLog = [];
for (const r of proposed) {
  if (r.destination.includes(':')) continue; // skip wildcards
  const check = destResults.find(d => d.url === r.destination);
  if (!check) continue;
  if (check.status === 404 || check.status === 0) {
    r._drop = true;
    r._reason = `destination ${check.status}`;
    fixLog.push(`DROP: ${r.source} -> ${r.destination} (dest ${check.status})`);
  } else if (check.status === 200 && check.final !== check.url && check.final !== check.url.replace(/\/$/, '')) {
    fixLog.push(`FIX: ${r.source} dest ${r.destination} -> ${check.final}`);
    r.destination = check.final.endsWith('/') ? check.final : check.final + '/';
  }
}

// 1c — Conflict check
const sources = proposed.filter(r => !r._drop).map(r => r.source);
const dupes = sources.filter((s, i) => sources.indexOf(s) !== i);
console.log(`\n--- Conflict Check ---`);
console.log(`Duplicate sources: ${dupes.length}`);
if (dupes.length) dupes.forEach(d => console.log(`  DUP: ${d}`));

// Check wildcards covering exact rules
const wildcards = proposed.filter(r => r.source.includes(':') && !r._drop);
const redundant = [];
for (const exact of proposed.filter(r => !r.source.includes(':') && !r._drop)) {
  for (const wc of wildcards) {
    const wcPrefix = wc.source.split(':')[0];
    if (exact.source.startsWith(wcPrefix) && exact.source !== wcPrefix) {
      // Check if destination would be the same
      if (wc.source === '/tag/:path*' && exact.source.startsWith('/tag/')) {
        redundant.push(exact.source);
        exact._drop = true;
        exact._reason = 'covered by /tag/:path*';
      }
      if (wc.source === '/category/:path*' && exact.source.startsWith('/category/')) {
        redundant.push(exact.source);
        exact._drop = true;
        exact._reason = 'covered by /category/:path*';
      }
    }
    // Date pattern
    if (wc.source.includes(':year') && exact.source.match(/^\/\d{4}\/\d{2}\/\d{2}\//)) {
      const slug = exact.source.replace(/^\/\d{4}\/\d{2}\/\d{2}\//, '/blog/');
      if (slug === exact.destination || slug === wc.destination.replace(':slug', exact.source.split('/').filter(Boolean).pop())) {
        redundant.push(exact.source);
        exact._drop = true;
        exact._reason = 'covered by date pattern wildcard';
      }
    }
  }
}
console.log(`Redundant (covered by wildcards): ${redundant.length}`);
if (redundant.length) redundant.forEach(r => console.log(`  REDUNDANT: ${r}`));

// Also check against EXISTING vercel.json redirects
const existingSources = new Set(existing.map(r => r.source));
const alreadyExists = proposed.filter(r => !r._drop && existingSources.has(r.source));
console.log(`Already in vercel.json: ${alreadyExists.length}`);
alreadyExists.forEach(r => {
  r._drop = true;
  r._reason = 'already in vercel.json';
  console.log(`  EXISTS: ${r.source}`);
});

// 1d — Loop check
const finalRules = proposed.filter(r => !r._drop);
const sourceSet = new Set(finalRules.map(r => r.source));
const loops = finalRules.filter(r => sourceSet.has(r.destination));
console.log(`\n--- Loop Check ---`);
console.log(`Loop risks: ${loops.length}`);
if (loops.length) loops.forEach(l => console.log(`  LOOP: ${l.source} -> ${l.destination} (dest is also a source)`));

// Save validated
const validated = proposed.filter(r => !r._drop);
console.log(`\n--- Summary ---`);
console.log(`Original: ${proposed.length}`);
console.log(`Dropped: ${proposed.filter(r => r._drop).length}`);
proposed.filter(r => r._drop).forEach(r => console.log(`  ${r._reason}: ${r.source}`));
console.log(`Validated: ${validated.length}`);

writeFileSync('audit/redirects-validated.json', JSON.stringify(validated, null, 2));
console.log('Wrote audit/redirects-validated.json');

if (fixLog.length) {
  console.log('\n--- Fix Log ---');
  fixLog.forEach(f => console.log(f));
}
