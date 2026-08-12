// merge-redirects.mjs — merge validated redirects into vercel.json
import { readFileSync, writeFileSync } from 'fs';

const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
const validated = JSON.parse(readFileSync('audit/redirects-validated.json', 'utf8'));

const existing = vercel.redirects || [];
const existingSources = new Set(existing.map(r => r.source));

// Filter out any that accidentally overlap with existing
const toAdd = validated.filter(r => !existingSources.has(r.source));

// Separate wildcards and exact
const wildcards = toAdd.filter(r => r.source.includes(':'));
const exact = toAdd.filter(r => !r.source.includes(':'));

// Sort exact alphabetically
exact.sort((a, b) => a.source.localeCompare(b.source));

// Merge: existing first, then new wildcards, then new exact
vercel.redirects = [...existing, ...wildcards, ...exact];

// Validate JSON parses
const json = JSON.stringify(vercel, null, 2);
JSON.parse(json); // will throw if malformed

writeFileSync('vercel.json', json + '\n');

console.log(`Existing redirects: ${existing.length}`);
console.log(`New wildcards added: ${wildcards.length}`);
console.log(`New exact rules added: ${exact.length}`);
console.log(`Total redirects: ${vercel.redirects.length}`);
console.log(`Under 1024 limit: ${vercel.redirects.length < 1024 ? 'YES' : 'NO — PROBLEM'}`);
console.log('vercel.json updated.');
