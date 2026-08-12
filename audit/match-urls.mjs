import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const DIR = import.meta.dirname;
const ROOT = resolve(DIR, '..');

// ---------- load data ----------
// 1. Live status
const liveLines = readFileSync(resolve(DIR, 'live-status.csv'), 'utf8')
  .split('\n').filter(Boolean).slice(1); // skip header

const liveData = liveLines.map(line => {
  // CSV with quoted fields: "old_path",status,"final_url","chain"
  const m = line.match(/^"([^"]*)",(\d+),"([^"]*)","([^"]*)"$/);
  if (!m) return null;
  return {
    old_path: m[1],
    status_code: parseInt(m[2]),
    final_url: m[3],
    redirect_chain: m[4]
  };
}).filter(Boolean);

// 2. New routes
const newRoutesRaw = readFileSync(resolve(DIR, 'new-routes.txt'), 'utf8')
  .split('\n').filter(Boolean);
const newRoutes = new Set();
const dynamicRoutes = [];
for (const r of newRoutesRaw) {
  if (r.includes('[DYNAMIC]')) {
    dynamicRoutes.push(r.replace(' [DYNAMIC]', ''));
  } else {
    newRoutes.add(r);
  }
}

// Also build slug index from new routes
const slugToRoute = new Map();
for (const route of newRoutes) {
  const parts = route.replace(/\/$/, '').split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  if (slug) {
    if (!slugToRoute.has(slug)) slugToRoute.set(slug, []);
    slugToRoute.get(slug).push(route);
  }
}

// Blog slugs specifically
const blogSlugs = new Set();
for (const route of newRoutes) {
  if (route.startsWith('/blog/')) {
    const slug = route.replace(/^\/blog\//, '').replace(/\/$/, '');
    if (slug) blogSlugs.add(slug);
  }
}

// 3. Existing redirects from vercel.json
const vercelConfig = JSON.parse(readFileSync(resolve(ROOT, 'vercel.json'), 'utf8'));
const existingRedirects = vercelConfig.redirects || [];

// Build a set of source paths (normalized with trailing slash)
const existingRedirectSources = new Set();
// Also handle wildcard patterns
const wildcardPatterns = [];
for (const r of existingRedirects) {
  const src = r.source.toLowerCase();
  existingRedirectSources.add(src);
  // Also add with/without trailing slash
  if (src.endsWith('/')) {
    existingRedirectSources.add(src.slice(0, -1));
  } else {
    existingRedirectSources.add(src + '/');
  }
  // Check for wildcard patterns
  if (src.includes(':path')) {
    wildcardPatterns.push({ pattern: src, destination: r.destination });
  }
}

function isAlreadyRedirected(path) {
  const p = path.toLowerCase();
  if (existingRedirectSources.has(p)) return true;
  if (existingRedirectSources.has(p.replace(/\/$/, ''))) return true;
  // Check wildcards
  for (const wp of wildcardPatterns) {
    const prefix = wp.pattern.split(':')[0];
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

// ---------- matching logic ----------
function matchUrl(oldPath) {
  // WP date-prefixed blog: /YYYY/MM/DD/slug/
  const wpBlogMatch = oldPath.match(/^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)\/?$/);

  // 1. Exact match in new routes
  if (newRoutes.has(oldPath)) {
    return { route: oldPath, confidence: 1.0, method: 'EXACT' };
  }
  // Without trailing slash
  const noSlash = oldPath.replace(/\/$/, '') + '/';
  if (newRoutes.has(noSlash)) {
    return { route: noSlash, confidence: 1.0, method: 'EXACT' };
  }

  // 2. WP blog URL -> /blog/slug/
  if (wpBlogMatch) {
    const slug = wpBlogMatch[1];
    const blogRoute = `/blog/${slug}/`;
    if (newRoutes.has(blogRoute)) {
      return { route: blogRoute, confidence: 1.0, method: 'WP-BLOG' };
    }
    // Also check if slug exists as blog content
    if (blogSlugs.has(slug)) {
      return { route: blogRoute, confidence: 0.95, method: 'WP-BLOG-SLUG' };
    }
  }

  // 3. Slug-only match
  const parts = oldPath.replace(/\/$/, '').split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  if (slug && slugToRoute.has(slug)) {
    const matches = slugToRoute.get(slug);
    // Prefer blog routes for content slugs
    const blogMatch = matches.find(r => r.startsWith('/blog/'));
    if (blogMatch) {
      return { route: blogMatch, confidence: 0.8, method: 'SLUG-BLOG' };
    }
    return { route: matches[0], confidence: 0.8, method: 'SLUG' };
  }

  // 4. Specific pattern mappings
  if (oldPath.startsWith('/calculator/') || oldPath.startsWith('/loan-calculator/')) {
    const calcSlug = parts[parts.length - 1];
    const calcRoute = `/loan-calculators/${calcSlug}/`;
    if (newRoutes.has(calcRoute)) {
      return { route: calcRoute, confidence: 0.8, method: 'CALC-REMAP' };
    }
    if (newRoutes.has('/loan-calculators/')) {
      return { route: '/loan-calculators/', confidence: 0.5, method: 'CALC-INDEX' };
    }
  }

  if (oldPath.startsWith('/programs/') || oldPath.startsWith('/loan-program/')) {
    const progSlug = parts[parts.length - 1];
    const progRoute = `/loan-programs/${progSlug}/`;
    if (newRoutes.has(progRoute)) {
      return { route: progRoute, confidence: 0.8, method: 'PROG-REMAP' };
    }
    if (newRoutes.has('/loan-programs/')) {
      return { route: '/loan-programs/', confidence: 0.5, method: 'PROG-INDEX' };
    }
  }

  // 5. Try partial slug matching (fuzzy)
  if (slug && slug.length > 3) {
    for (const route of newRoutes) {
      const routeSlug = route.replace(/\/$/, '').split('/').pop();
      if (routeSlug && routeSlug === slug) {
        return { route, confidence: 0.8, method: 'SLUG-CROSS' };
      }
    }
  }

  return { route: null, confidence: 0, method: 'NONE' };
}

function recommendation(status, isRedirected, confidence, oldPath) {
  if (status === 200) return 'OK';
  if (isRedirected) return 'ALREADY-REDIRECTED';
  if (confidence >= 0.8) return '301';
  if (confidence >= 0.5) return 'REVIEW';

  // Check if it has a real content slug
  const parts = oldPath.replace(/\/$/, '').split('/').filter(Boolean);
  const slug = parts[parts.length - 1];
  const junkSlugs = /^(page|elementor|template|popup|feed|cart|checkout|shop|my-account|\d+)$/;
  if (slug && slug.length > 3 && !junkSlugs.test(slug)) {
    return 'REBUILD';
  }

  return 'LET-DIE';
}

// ---------- process ----------
const auditResults = [];
const proposedRedirects = [];
const alreadyRedirectedPaths = new Set(); // track to avoid duplicate proposals

for (const item of liveData) {
  const { old_path, status_code, final_url, redirect_chain } = item;
  const isRedirected = isAlreadyRedirected(old_path);

  let match = { route: null, confidence: 0, method: 'NONE' };
  if (status_code !== 200 && !isRedirected) {
    match = matchUrl(old_path);
  }

  const rec = recommendation(status_code, isRedirected, match.confidence, old_path);

  auditResults.push({
    old_url: `https://www.stairwaymortgage.com${old_path}`,
    final_status: status_code,
    final_url,
    matched_new_route: match.route || '',
    confidence: match.confidence,
    recommendation: rec
  });

  // Generate redirect proposal
  if (rec === '301' && match.route && !isRedirected) {
    const src = old_path.replace(/\/$/, '') + '/';
    if (!alreadyRedirectedPaths.has(src)) {
      alreadyRedirectedPaths.add(src);
      proposedRedirects.push({
        source: src,
        destination: match.route,
        permanent: true
      });
    }
  }
}

// Add wildcard redirects
// Check if /tag/ and /category/ patterns exist
const tagDest = newRoutes.has('/blog/') ? '/blog/' : '/';
proposedRedirects.push(
  { source: '/tag/:path*', destination: tagDest, permanent: true },
  { source: '/category/:path*', destination: tagDest, permanent: true }
);

// WP date pattern: /YYYY/MM/DD/:slug -> /blog/:slug
// Verify that blog slugs actually match WP date URLs
const wpDateUrls = liveData.filter(d =>
  d.old_path.match(/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/)
);
let wpSlugMatches = 0;
for (const u of wpDateUrls) {
  const m = u.old_path.match(/^\/\d{4}\/\d{2}\/\d{2}\/([^/]+)/);
  if (m && blogSlugs.has(m[1])) wpSlugMatches++;
}
console.log(`\nWP date URLs: ${wpDateUrls.length}, matching blog slugs: ${wpSlugMatches}`);
if (wpSlugMatches > 0) {
  // Only add if there are actual matches
  // Check if not already covered by existing redirects
  const alreadyHasWpPattern = existingRedirects.some(r =>
    r.source.includes(':slug') && r.source.match(/\/\d/)
  );
  if (!alreadyHasWpPattern) {
    proposedRedirects.push(
      { source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug/', destination: '/blog/:slug/', permanent: true }
    );
  }
}

// ---------- save ----------
// 1. url-audit.csv
const auditCsv = ['old_url,final_status,final_url,matched_new_route,confidence,recommendation'];
for (const r of auditResults) {
  auditCsv.push([
    `"${r.old_url}"`,
    r.final_status,
    `"${r.final_url}"`,
    `"${r.matched_new_route}"`,
    r.confidence,
    r.recommendation
  ].join(','));
}
writeFileSync(resolve(DIR, 'url-audit.csv'), auditCsv.join('\n') + '\n');

// 2. redirects-proposed.json
writeFileSync(resolve(DIR, 'redirects-proposed.json'),
  JSON.stringify(proposedRedirects, null, 2) + '\n');

// ---------- summary ----------
const recCounts = {};
for (const r of auditResults) {
  recCounts[r.recommendation] = (recCounts[r.recommendation] || 0) + 1;
}

console.log(`\n=== URL AUDIT SUMMARY ===`);
console.log(`Total URLs audited: ${auditResults.length}`);
console.log(`\nBy recommendation:`);
for (const [rec, count] of Object.entries(recCounts).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${rec}: ${count}`);
}
console.log(`\nProposed redirects: ${proposedRedirects.length}`);
console.log(`  - Specific 301s: ${proposedRedirects.filter(r => !r.source.includes(':path') && !r.source.includes(':year')).length}`);
console.log(`  - Wildcard patterns: ${proposedRedirects.filter(r => r.source.includes(':path') || r.source.includes(':year')).length}`);

// GSC summary
console.log(`\n=== GSC COVERAGE SUMMARY ===`);
for (const prop of ['gsc-property-1', 'gsc-property-2']) {
  console.log(`\n${prop}:`);
  try {
    const csvData = readFileSync(resolve(DIR, prop, 'Critical issues.csv'), 'utf8');
    const lines = csvData.split('\n').filter(Boolean).slice(1);
    for (const line of lines) {
      // Parse CSV line
      const parts = line.match(/(".*?"|[^,]+)/g);
      if (parts && parts.length >= 4) {
        const reason = parts[0].replace(/^"|"$/g, '');
        const count = parts[3].replace(/^"|"$/g, '');
        if (parseInt(count) > 0) {
          console.log(`  ${reason}: ${count}`);
        }
      }
    }
  } catch (e) {
    console.log(`  (could not read: ${e.message})`);
  }
}

console.log(`\n=== DONE ===`);
