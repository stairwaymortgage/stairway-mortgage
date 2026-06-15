# STAIRWAY MORTGAGE — CANONICAL RULEBOOK v12

**The single source of truth for the final site audit.** Every page on the site is
checked against this. Where this document and any older doc disagree, **this
document wins.** It consolidates: the v11 Architecture doc (SEO/structure rules),
the master project context, project memory (compliance/CTA/brand), and resolves
the stale-value conflicts that existed across those sources.

Each rule maps to an audit code in `audit_v12.py`. "Universal" = checked on every
page. "Depth" = checked only on hub/sub pages (content-depth rules a legal page
can't meet).

---

## 0. RESOLVED CONFLICTS (read first)

These values were inconsistent across the old docs. The winner is locked here:

| Item | Stale value (DO NOT USE) | **Canonical value** | Source of truth |
|---|---|---|---|
| Phone | (954) 255-6680 | **(954) 993-1625** | confirmed by Jim, this chat |
| Closed-loan stat | $350M / $350M+ | **$500M+** | confirmed by Jim, this chat |
| Display font | Instrument Serif | **Fraunces** | type-system update |
| Body font | IBM Plex Sans / Geist | **Inter** | type-system update (replaces IBM Plex site-wide) |
| Mono font | — | **JetBrains Mono** | master context (labels/eyebrows only) |
| H1 sizing | fixed rem (too big on mobile) | **`clamp()` fluid** — `clamp(2.8rem,6vw,5.2rem)` | type-system update |
| Color palette | blue #1845D6 / ink #0A0E1A | **forest palette** — see §1.6 | type-system update |
| Review count | 624 | **see §6** (verify live before locking) | reviews dataset |
| Header CTA | "Schedule a call with Jim" | **"Talk to Our Team"** | project memory |
| Page CTA | "Talk to Jim about…" | **"See My Options" / "Talk to Our Team"** | project memory |

The v11 Architecture doc's §7.1 template and shell spec still say "Talk to Jim" /
"Schedule a call with Jim." **That doc is superseded on CTA wording by project
memory.** The architecture doc remains canonical for SEO/structure rules only.

---

## 1. COMPLIANCE & BRAND (Universal — every page)

### 1.1 NMLS placement — `TECH-6`, `TECH-8`
- Jim's individual **NMLS #1072866** → hero, body, trust signals, bio. Must
  appear **≥2×** on every hub/sub page.
- NEXA company **NMLS #1660690** → **footer ONLY** as a marketing/trust signal.
  Must appear **0×** in page body **as a trust signal near Jim**.
- The "48 states" licensing claim → **always attributed to NEXA, in the footer**,
  never adjacent to Jim's name in marketing content. `TECH-8` blocklist:
  "licensed in 48 states", "licensed in 47/49/all 50 states", "founded in 2007",
  "nexa mortgage", "1660690". Zero body hits **in marketing context**.
- NMLS Consumer Access links → Jim's individual profile
  (`/Individual/1072866`), never `/Company/1660690`.

**Marketing claim vs required disclosure (TECH-6a/TECH-8 exemptions):**
The following contexts are EXEMPT from TECH-6a/TECH-8 because they are
**required regulatory disclosures**, not marketing claims:
  - "Equal Housing Lender" + NMLS #1660690 compliance boilerplate (case studies,
    loan programs) — required by Reg Z / ECOA
  - "division of NEXA Mortgage LLC" entity attribution — legal requirement
  - "dba Stairway Mortgage — NMLS #1660690" in disclosure paragraphs
  - Legal pages (privacy, terms, state-licensing) — full entity disclosure required
  - NEXA partnership page (`/nexa-mortgage-partnership/`) — editorial, intentional
  - Blog posts editorially discussing NEXA — legitimate editorial content
  - Content inside `<aside>`, `<small>`, `.compliance`, `.disclosure` wrappers
The audit exempts these contexts automatically. A FAIL fires only when NEXA
claims appear as marketing trust signals in hero/body/CTA areas near Jim.

### 1.2 CTA wording — `CTA-1`
- Allowed CTAs: **"See My Options"**, **"Talk to Our Team"**.
- **Banned everywhere except reviews & founder/story copy:** "Talk to Jim",
  "call with Jim", "Schedule a call with Jim", any CTA using Jim's first name.
- Jim's name MAY appear in: testimonial/review text, the founder/philosophy/bio
  story copy. Nowhere else as a CTA.
- Loan-application CTAs route to Arive
  (`stairwaymortgage.my1003app.com/agent/jimblackburn/inquiry` for inquiry, root
  for full app). "See My Options" → inquiry; primary apply → full app.

### 1.3 Phone — `PHONE-1`
- Canonical: **(954) 993-1625**. The string `255-6680` must appear **0×** site-wide.

### 1.4 Stats (defensible only) — `STAT-1`
- Closed loans: **$500M+** (string `$3xxM` must be 0×).
- **7× Scotsman Guide Top Producer**, **300+ lenders**, **24hr approval**.
- Review count: use the live-verified number (§6), not a hardcoded 624.
- No rate/APR promises, no approval guarantees anywhere.

### 1.5 Fonts — `FONT-1`, `FONT-2`
- Display/headlines: **Fraunces** (serif, optical sizing on). H1, H2, H3, pull-quotes.
- Body/UI/everything else: **Inter** (replaces IBM Plex Sans site-wide). Paragraphs,
  nav, labels, buttons, captions.
- Mono: **JetBrains Mono** — eyebrows/stat-labels only (optional accent).
- Stale fonts that must appear 0×: "Instrument Serif", "Geist", **"IBM Plex"**.
- `FONT-2`: every `<h1>` must resolve to Fraunces (the display family) — never the
  body font. Headlines in the body font is a FAIL.
- Google Fonts import (canonical): Fraunces `9..144, 300..700` + Inter `400;500;600;700`.

### 1.5b H1 readability & mobile sizing — `MOB-H1`
- H1 font-size **must use `clamp()`** (fluid), never a fixed `rem`/`px`. Fixed H1
  sizes overflow on phones — this is the locked fix for the "too big on mobile"
  problem.
- Canonical H1 scale: **`clamp(2.8rem, 6vw, 5.2rem)`** (floor 2.8rem on mobile,
  ceiling 5.2rem on desktop). H2 may use `clamp(2rem, 4vw, 2.6rem)`.
- `.display` class: `font-optical-sizing:auto; line-height:1.02; letter-spacing:-0.02em`.

### 1.6 Design tokens (forest palette — adopted SUBTLY)
Replaces the old blue/ink palette. **Adoption is minimal/restrained, not a repaint.**

Canonical tokens (define these in global.css, remove the stale ones):
- `--ink:#1a2420` — primary text (near-black warm)
- `--forest:#1f3d34` · `--forest-deep:#15302a` — **thin accent only** (see usage rule)
- `--cream:#f7f5ef` — **default page background site-wide** (replaces stark white/old paper)
- `--paper:#ffffff` — cards/raised surfaces only
- `--royal:#2f47c9` — the single accent: CTAs, eyebrows, links (used sparingly)
- `--muted:#6b7770` — secondary text · `--line:#e3e0d6` — hairline borders
- Type scale (1.25): `--step--1:0.8rem` … `--step-5:3.5rem`,
  `--step-6:clamp(2.8rem,6vw,5.2rem)` (H1).

**USAGE RULE — green is seasoning, not the dish:**
- Cream `#f7f5ef` is the pervasive, quiet shift — it's the default body background
  everywhere. This is what makes the site feel cohesive without shouting.
- Forest green appears ONLY as a **thin accent**: hairline rules, small borders,
  eyebrow ticks, icon strokes, an occasional small detail. NOT as large background
  fills, NOT section-after-section, NOT card backgrounds, NOT the hero fill.
- Text stays `--ink`; the one accent for interactive/emphasis is `--royal`.
- Audit does NOT force green onto pages (that would push over-adoption). It only
  enforces that stale tokens are gone and the new tokens are the defined set.

Stale tokens to migrate OUT of global.css (must be 0× in the token definitions):
`#1845D6` (old blue), `#0A0E1A` (old ink), `#FAFAF7`/`#F4F2EC`/`#EAE7DE` (old papers),
`#8B2C2C` (rust), `#2E9E2E` (green), `#E0A96D` (gold), `#2d2350`/`#382b62` (old violet).

---

## 2. TECHNICAL SEO (Universal — every page)

| Code | Rule | Correct value |
|---|---|---|
| `SEO-H1` | Exactly **one** `<h1>` per page | 1 |
| `SEO-HORD` | No skipped heading levels (no H2→H4) | sequential |
| `SEO-TTL` / `SEO-TTLLEN` | `<title>` present, ≤60 chars | required, ≤60 |
| `SEO-DESC` / `SEO-DESCLEN` | Meta description present, 50–160 chars | required |
| `SEO-CANON` | Canonical link present | required |
| `SEO-CANONABS` | Canonical NOT hardcoded to `.vercel.app` | use site origin / relative |
| `SEO-OG` | Open Graph tags (og:title, og:description, og:image, og:url) | ≥3 |
| `SEO-TW` | Twitter card tags | ≥2 |
| `SEO-LANG` | `<html lang="en">` | required |
| `SEO-IDX` | Page indexable (no accidental `noindex`) | indexable |
| `SEO-LD` | JSON-LD structured data | present (FAQPage on sub-pages; LocalBusiness/Org sitewide) |

> Most of these live in the shared **Layout.astro**. Fix them there once → they
> propagate to every page. This is why BATCH-SHARED runs first.

**Domain-agnostic rule (critical, pre-launch):** canonical, OG `url`, sitemap base,
internal links, and any absolute asset URLs must use the site origin / relative
paths — **never hardcode `stairway-vercel.vercel.app`.** At launch the domain
switches to `stairwaymortgage.com`; hardcoded `.vercel.app` breaks SEO and OG
previews. Testimonial photo URLs switch absolute→relative at launch.

---

## 3. MOBILE / PERFORMANCE (Universal — every page)

| Code | Rule | Correct value |
|---|---|---|
| `MOB-VP` | Viewport meta with `width=device-width, initial-scale=1` | required |
| `MOB-DIM` | `<img>` has explicit `width`+`height` (prevents CLS) | ≤2 exceptions |
| `A11Y-ALT` | Every `<img>` has descriptive `alt` | 0 missing |

Manual checks (not automatable in the harness — do per batch in DevTools):
- Renders correctly at **375×812** (mobile) and **1440** (desktop): hero, grids,
  tables, FAQ, CTA.
- Tap targets ≥44px, no horizontal scroll, mobile nav collapses at 768px.
- Lighthouse: Accessibility ≥90, no critical CLS/LCP regressions.

---

## 4. LINK INTEGRITY (Universal — `LINK-1`, repo mode)
- Every internal `href="/..."` must resolve to a real route in `src/pages/**` or
  a real asset in `public/**`. Broken internal links FAIL.
- URLs/slugs are **SACRED**: preserve 1:1 with WordPress permalinks. Add 301s only
  for unavoidable changes. Source of truth = WordPress XML/WXR export.
- No links to not-yet-built pages in nav (use non-clickable `<span>` for
  "Coming Soon", never a dead `href`).

---

## 5. CONTENT DEPTH (Depth — hub/sub pages only)

Scaled by page type. A blog post, calculator, or legal page is **exempt** (these
checks become INFO, not FAIL). Goal-centered bands from v11 §8.11:

| Code | Sub-page | Hub | Notes |
|---|---|---|---|
| `ST-4` word count | goal **7,000** (band 6,000–8,000, warn 6,500–7,500) | goal **2,500** (band 2,000–3,000, warn 2,300–2,700) | land at goal, not band edge |
| `KW-1` density | L≤3: goal 1.8% (band 1.0–2.5%); L=4: goal 2.3% (band 1.5–3.0%); L≥5: goal 2.8% (band 2.0–3.5%) | same | length-scaled |
| `KW-3` H1 | contains **singular** keyword | yes | "pilot mortgage" not "pilots mortgage" |
| `KW-4` H2 | ≥50% of H2s contain keyword/variant | yes | |
| `ST-3` FAQ | exactly **25** | exactly **10** | numbered, substantive |
| `KW-5` FAQ kw | ≥20/25 contain keyword | ≥8/10 | |
| `CIT-1` citations | ≥50 external | ≥25 | excl. own domain/CDN/fonts |
| `CIT-2` Tier-1 | goal **55%** (warn floor 50%, hard floor 40%) | same | .gov/.mil/.edu/GSE/regulators |

**Singular-keyword rule:** slugs are PLURAL (`/pilots/`), keyword phrases are
SINGULAR ("pilot mortgage"). Keyword includes "mortgage"; slug drops it.

---

## 6. TESTIMONIALS (Universal where present — IMG-4 / IMG-6)
- Avatars use **i.pravatar.cc/300?img=N** with a **unique face index per card,
  site-wide** (no index reused on two pages — `IMG-6`). Pexels CDN proved
  unreliable; pravatar is the standard.
- `object-position: 50% 25%`, `overflow:hidden`, `onerror` fallback to
  placehold.co (makes load failures visible, not silent initials).
- Real headshots at `public/testimonials/{firstname-lastname}.jpg` are served at
  `/testimonials/` for the homepage carousel; switch absolute→relative at launch.
- Reviews dataset: Google (87), Birdeye aggregates (537). Verify the displayed
  aggregate count against the live source before locking the number; do not
  hardcode the stale 624.
- No red "EXAMPLE SCENARIO" banners or compliance-overlay badges, ever.

---

## 7. STRUCTURE & BUILD HYGIENE
- FAQ closing-div pattern validated; div/`<details>` balance must be even
  (pre-zip structural check — caught 8 missing `</div>` in production previously).
- Astro forms: `is:inline` + plain JS only (TypeScript breaks the Astro build).
  Enter-key early-submit guard on every form. OTP placeholder `000000`.
- Server-render cards as real HTML; use JS only to filter/toggle classes
  (JS-generated tiles are unstyled + uncrawlable under Astro's scoped styles).
- Hub integration: `.{hub}-scope` CSS wrapper, strip `<head>`, scope `<style>`,
  wrap body in site Layout (the aviation `.av-scope` pattern).

---

## 8. PAGE-TYPE → RULE MATRIX

| Page type | Compliance §1 | Tech SEO §2 | Mobile §3 | Links §4 | Depth §5 | Testimonials §6 |
|---|---|---|---|---|---|---|
| Hub | ✅ | ✅ | ✅ | ✅ | ✅ (hub bands) | ✅ |
| Sub-page | ✅ | ✅ | ✅ | ✅ | ✅ (sub bands) | ✅ |
| Blog post | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | if present |
| Calculator | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | ⬜ |
| Loan program | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | if present |
| Case study | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | if present |
| 8-steps page | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | if present |
| Legal/misc/partner | ✅ | ✅ | ✅ | ✅ | ⬜ INFO | ⬜ |

✅ = must PASS · ⬜ = exempt (INFO only)

---

## 9. THE FIX-ORDER (when a page has multiple FAILs)
1. Compliance FAILs (CTA, phone, stat, NMLS, NEXA-claims) — legal/brand risk first.
2. Technical-SEO FAILs (canonical, single-H1, viewport, indexable, meta).
3. Link FAILs.
4. WARNs (OG/Twitter/JSON-LD, image dims, heading order, citation drift).

Never guess a "correct value." If it's not in this rulebook, STOP and ask Jim —
placeholders are always wrong (project rule).

---

## 10. ASTRO / TAILWIND v4 STRUCTURAL RULES (learned this session — critical)

These caused real production bugs. The audit and every build must enforce them.

### 10.1 Token naming — avoid Tailwind @theme collision (`--stw-` prefix)
- Tailwind v4 `@theme` reserves `--font-*`, `--color-*`, `--text-*` namespaces and
  re-emits custom props in those namespaces as SELF-REFERENCING declarations
  (`--font-display: var(--font-display)`), which resolve to nothing -> silent
  fallback to Georgia/Times (fonts) or wrong colors.
- RULE: brand tokens use the `--stw-` prefix (`--stw-display`, `--stw-body`),
  defined in a plain `:root{}` block, NOT inside `@theme{}`.
- Bake a literal fallback into every var(): `var(--stw-display, 'Fraunces'), Georgia, serif`.
- AUDIT CHECK: grep built CSS for `X:var(--X)` circular patterns -> FAIL.
  Also check `--color-*` tokens for the same circular bug (same root cause).

### 10.2 JS-built DOM needs `<style is:global>`
- Astro scopes `<style>` by default; scoped rules do NOT apply to elements created
  at runtime via innerHTML/createElement (forms, quiz, any JS-rendered cards).
- RULE: any component that builds DOM in JS must use `<style is:global>` with
  class-namespaced selectors (`.dq-*`, `.aic*`) so nothing leaks.
- This was why the Discovery Quiz styling never applied. Check all native forms
  (Reverse Mortgage, CalcLeadForm, The Drawing) for the same.

### 10.3 Fonts — load via <link>, full axis, in <head>
- Load Fraunces+Inter via `<link rel="stylesheet">` in Layout <head>, NOT CSS
  `@import` (FOUT: headings flash Times before swap).
- URL must include FULL axes: `Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600`.
  Missing `ital` -> synthetic (fake) italics. Missing weight range -> thin headlines.
- H1 = Fraunces 600, fluid `clamp(2.4rem,5.5vw,4.6rem)`; H2/H3 clamped; body = Inter,
  >=16px; `@media(max-width:480px)` caps. `* { min-width:0 }` + `overflow-x:hidden`
  guard on html/body to prevent mobile horizontal overflow.

### 10.4 Deploy — webhook-miss recovery
- After every push, confirm origin/master HEAD == Vercel production deployment.
  If Vercel didn't pick up the push (intermittent webhook miss), push an empty
  commit (`git commit --allow-empty`, authored as stairwaymortgage) to re-trigger.
- NEVER `vercel --prod` / `vercel deploy` from local (writes backslash paths,
  404s subdir routes). git push ONLY.

### 10.5 Iframe / third-party embeds
- Wrap fixed-width embeds (FRED 670px, Optimal Blue) in a responsive container
  (`max-width:100%`, `aspect-ratio`) so they don't overflow mobile.
- Copy embed src verbatim; only edit documented color/config query params.

## 11. SEO CARRY-FORWARD (from WordPress XML)
- 505 RankMath title/description/focus-keyword records exist (seo-map.json),
  keyed by URL path. Apply to matching new routes; prefer a central path->seo
  lookup in Layout over 505 file edits.
- 567 old published URLs (url-inventory.json) must each resolve 1:1 on the new
  site or 301-redirect. URLs are sacred — preserve slugs; redirect only on change.
- JSON-LD by type: Org/MortgageBroker sitewide; FAQPage where FAQs exist;
  Article/BlogPosting on the 150 posts (carry author+date from XML); Course on
  /courses/; BreadcrumbList on hub/sub. Sitemap excludes noindex/redirect stubs.
