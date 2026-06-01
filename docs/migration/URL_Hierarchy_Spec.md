# Stairway Mortgage — Canonical URL Hierarchy & Redirect Spec
### The single source of truth for every page URL on the new Astro site. Follow this for ALL content types.

---

## The rule
Two-level `hub/slug` for everything. Primary keyword as close to the front of the slug as
possible, nested under a clear section hub. Hubs concentrate topical authority and create clean
crawl paths. No deeper nesting (it pushes keywords away from the domain and creates thin
intermediate pages). No dates in slugs (evergreen content shouldn't look stale).

## The hierarchy (LOCKED)

| Content type      | URL pattern                    | Example                              | Status            |
|-------------------|--------------------------------|--------------------------------------|-------------------|
| Blog posts        | `/blog/{slug}/`                | `/blog/dscr-loan-meaning/`           | CHANGED — see §A  |
| Loan programs     | `/loan-programs/{slug}/`       | `/loan-programs/dscr-loan/`          | keep as-is        |
| Case studies      | `/case-studies/{slug}/`        | `/case-studies/dscr-loan/`           | keep as-is        |
| Calculators       | `/loan-calculator/{slug}/`     | `/loan-calculator/build-to-sell/`    | keep as-is (Jim's call: avoid 132 redirects) |
| Category archives | `/blog/category/{slug}/`       | `/blog/category/first-time-investors/` | new (nested under blog) |
| Tag archives      | `/blog/tag/{slug}/`            | `/blog/tag/dscr-loan/`               | new (nested under blog) |

Astro file → URL mapping (file location determines import depth — get it right):
- `src/pages/blog/{slug}.astro`            → `/blog/{slug}/`            (imports: `../../layouts`, `../../components`)
- `src/pages/loan-programs/{slug}.astro`   → `/loan-programs/{slug}/`   (imports: `../../`)
- `src/pages/case-studies/{slug}.astro`    → `/case-studies/{slug}/`    (imports: `../../`)
- `src/pages/loan-calculator/{slug}.astro` → `/loan-calculator/{slug}/` (imports: `../../`)

## §A — Blog: the one structural change
Old WordPress permalinks were dated: `/2025/11/05/dscr-loan-meaning/`. New: `/blog/dscr-loan-meaning/`.
- Date-free (evergreen, higher CTR), keyword-forward, hub-structured (topical authority).
- ALL 150 posts move. Verified: zero slug collisions, zero non-standard URLs. Map: `blog_slug_map.json`.
- **Every old dated URL gets a 301 → its new `/blog/` URL.** Non-negotiable: this transfers ranking
  equity and backlinks. Without the 301, the move destroys rankings (the exact failure this migration exists to prevent).

## Redirect mechanism (Astro native → Vercel honors it)
Add to `astro.config.mjs`. Astro emits these as 301s; Vercel serves them. Example for a few posts:
```js
import { defineConfig } from 'astro/config';
export default defineConfig({
  redirects: {
    '/2025/11/05/dscr-loan-meaning/': '/blog/dscr-loan-meaning/',
    '/2025/07/29/house-hacking/': '/blog/house-hacking/',
    // ...all 150 from blog_slug_map.json
  },
});
```
Generate the full 150-entry block programmatically from `blog_slug_map.json` (don't hand-type — typos = 404s).
Default Astro redirect status is 301 (permanent) for string-form entries — correct for SEO equity transfer.

## Internal-link cleanup (sacred-link rule, applied deliberately)
Posts link to each other using OLD dated URLs in their body HTML. Two-layer safety:
1. The 301s catch any missed internal link (old URL still resolves).
2. BUT also rewrite internal links that point to old dated post URLs → new `/blog/` URLs, so there
   are no redirect chains (a link → 301 → final is slower and slightly leaks equity vs. a direct link).
   This is a DELIBERATE, verifiable rewrite (old→new from the slug map), NOT regeneration from memory —
   so it stays within the sacred-link rule. External links and non-post internal links: untouched, verbatim.

## Canonical + sitemap
- Every page's `<link rel="canonical">` uses its FINAL URL from this spec (never an old/interim URL).
- `@astrojs/sitemap` emits the new URLs only. Old dated URLs appear ONLY as redirect sources, never in the sitemap.

## QA gate (every page, before "done")
- URL matches this spec exactly (hub + slug + trailing slash).
- Canonical = final URL.
- For moved posts: old URL 301s to new URL (test it returns 301, not 404, not 200).
- All internal links resolve 200 (no 404s, no chains to old URLs).
- NMLS: Jim #1072866 in body; NEXA #1660690 footer only.

---
*This spec overrides any earlier URL guidance. Calculators stay at `/loan-calculator/` per Jim. Everything else: two-level hub/slug, blog de-dated with 301s.*
