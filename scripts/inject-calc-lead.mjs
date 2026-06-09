// inject-calc-lead.mjs — wire the CalcLeadForm popup into every calculator page.
//
// For each src/pages/loan-calculator/*.astro it does THREE idempotent edits:
//   1. CTA swap   : <a class="cta-primary" href="...">TEXT</a>
//                -> <a class="cta-primary" data-calc-cta data-calc-slug="{slug}">TEXT</a>
//                   (only the cta-primary anchor; href removed so it no longer links out;
//                    class + visible text kept exactly as-is)
//   2. Import     : add  import CalcLeadForm from '../../components/CalcLeadForm.astro';
//                   right after the Layout import in frontmatter.
//   3. Render     : add  <CalcLeadForm />  just before the first </Layout>.
//
// slug = filename without .astro  ->  form_source becomes calc_{slug} (set in the component).
//
// Usage:
//   node scripts/inject-calc-lead.mjs --dry           # diff first 3 files, write nothing
//   node scripts/inject-calc-lead.mjs --dry --all     # diff ALL files, write nothing
//   node scripts/inject-calc-lead.mjs --write          # apply to ALL files
//   node scripts/inject-calc-lead.mjs --write --only heloc,college-costs-calculator
//
// Calculator math / input IDs / NMLS are never touched — only the three edits above.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const DIR = 'src/pages/loan-calculator';
const IMPORT_LINE = "import CalcLeadForm from '../../components/CalcLeadForm.astro';";
const LAYOUT_IMPORT_RE = /^(\s*import\s+Layout\s+from\s+['"][^'"]+['"];?\s*)$/m;
const RENDER_TAG = '  <CalcLeadForm />';

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const WRITE = args.includes('--write');
const ALL = args.includes('--all');
const onlyIdx = args.indexOf('--only');
const ONLY = onlyIdx !== -1 && args[onlyIdx + 1] ? args[onlyIdx + 1].split(',') : null;

if (!DRY && !WRITE) {
  console.error('Pass --dry (preview) or --write (apply). Aborting.');
  process.exit(1);
}

function transform(src, slug) {
  let out = src;
  const notes = [];

  // 1. CTA swap — match the cta-primary anchor's opening tag, replace its href with data attrs.
  if (/data-calc-cta/.test(out)) {
    notes.push('cta: already wired (skipped)');
  } else {
    const ctaRe = /(<a\s+class="cta-primary")\s+href="[^"]*"(\s*>)/;
    if (ctaRe.test(out)) {
      out = out.replace(ctaRe, `$1 data-calc-cta data-calc-slug="${slug}"$2`);
      notes.push('cta: swapped');
    } else {
      notes.push('cta: NOT FOUND — left untouched');
    }
  }

  // 2. Import after Layout import.
  if (out.includes(IMPORT_LINE)) {
    notes.push('import: already present (skipped)');
  } else if (LAYOUT_IMPORT_RE.test(out)) {
    out = out.replace(LAYOUT_IMPORT_RE, (m) => m.replace(/\s*$/, '\n') + IMPORT_LINE);
    notes.push('import: added');
  } else {
    notes.push('import: Layout import NOT FOUND — skipped');
  }

  // 3. Render before first </Layout>.
  if (out.includes('<CalcLeadForm')) {
    notes.push('render: already present (skipped)');
  } else {
    const idx = out.indexOf('</Layout>');
    if (idx !== -1) {
      out = out.slice(0, idx) + RENDER_TAG + '\n' + out.slice(idx);
      notes.push('render: added');
    } else {
      notes.push('render: </Layout> NOT FOUND — skipped');
    }
  }

  return { out, notes };
}

// Tiny line-level diff for preview.
function miniDiff(a, b) {
  const al = a.split('\n'), bl = b.split('\n');
  const lines = [];
  let i = 0, j = 0;
  while (i < al.length || j < bl.length) {
    if (al[i] === bl[j]) { i++; j++; continue; }
    // look-ahead: treat as additions until lines resync
    if (bl[j] !== undefined && !al.includes(bl[j], i)) { lines.push('  + ' + bl[j]); j++; continue; }
    if (al[i] !== undefined && !bl.includes(al[i], j)) { lines.push('  - ' + al[i]); i++; continue; }
    if (al[i] !== bl[j]) { lines.push('  - ' + al[i]); lines.push('  + ' + bl[j]); i++; j++; }
  }
  return lines;
}

let files = readdirSync(DIR).filter((f) => f.endsWith('.astro'));
if (ONLY) files = files.filter((f) => ONLY.includes(basename(f, '.astro')));
files.sort();

const previewLimit = DRY && !ALL ? 3 : files.length;
let changed = 0, skipped = 0, problems = [];

files.forEach((file, n) => {
  const path = join(DIR, file);
  const slug = basename(file, '.astro');
  const src = readFileSync(path, 'utf8');
  const { out, notes } = transform(src, slug);
  const didChange = out !== src;

  if (notes.some((x) => /NOT FOUND/.test(x))) problems.push(`${file}: ${notes.filter((x) => /NOT FOUND/.test(x)).join(', ')}`);

  if (DRY && n < previewLimit) {
    console.log('\n=== ' + file + '  (slug: ' + slug + ') ===');
    console.log('   ' + notes.join(' | '));
    if (didChange) miniDiff(src, out).forEach((l) => console.log(l));
  }

  if (WRITE) {
    if (didChange) { writeFileSync(path, out); changed++; }
    else skipped++;
  }
});

console.log('\n----------------------------------------');
console.log('Files matched: ' + files.length);
if (DRY) console.log('DRY RUN — nothing written. Previewed ' + Math.min(previewLimit, files.length) + (ALL ? ' (all)' : ' (first 3; pass --all for every file)') + '.');
if (WRITE) console.log('WROTE ' + changed + ' file(s), ' + skipped + ' already-wired/unchanged.');
if (problems.length) {
  console.log('\n!! ' + problems.length + ' file(s) with NOT-FOUND markers (review before relying on them):');
  problems.forEach((p) => console.log('   ' + p));
} else {
  console.log('No NOT-FOUND problems — all three anchors present in every file.');
}
