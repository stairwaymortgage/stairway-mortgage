# Lead Attribution — Canonical Field Mapping

Single source of truth for every lead submitted by any form on the site.
All forms enrich their submit payload through one shared helper
(`src/lib/lead-attribution.js`, exposed as `window.STW_leadAttribution()`),
and fire one GA4 event (`window.STW_fireGenerateLead()`) on a successful
(`response.ok`) webhook POST.

This doc is CRM-agnostic: the **Goat Genie custom field** column is the
contract today, but the canonical key + source columns stay valid for any
future CRM. When a field is created in Goat Genie, replace its `TODO` with the
real custom-field key/ID.

> ⚠️ **Goat Genie custom fields marked `TODO` must be created in Goat Genie
> first**, then mapped to the canonical key below. Until then the data still
> ships in the webhook payload under the canonical key — it simply isn't mapped
> to a dedicated field yet.

## How it flows

1. `LoAttribution.astro` (unchanged) **writes** the first-touch / UTM / umtid /
   loid cookies as visitors land and navigate.
2. `src/lib/lead-attribution.js` **reads** those cookies and returns the
   canonical object. It is inlined into the `<head>` of every page by both
   layouts (`Layout.astro`, `LandingLayout.astro`), so `window.STW_leadAttribution`
   and `window.STW_fireGenerateLead` are available to every inline form script.
3. Each form folds the canonical fields into its existing payload (keeping its
   own `umtid`, `loid`, `page_url`, etc. unchanged) and POSTs to its webhook.
4. On `response.ok`, the form calls `window.STW_fireGenerateLead(...)` exactly
   once. On failure it logs with `console.warn` and still shows its thank-you UI.

## Canonical keys

| Canonical key | Where it comes from | Sent in webhook payload? | GA4 `generate_lead` param | Goat Genie custom field |
|---|---|---|---|---|
| `landing_page` | `first_touch_url` cookie (first-touch entry URL), falling back to the current `location.href` | ✅ yes | — | `TODO` (create: Landing Page / URL text field) |
| `utm_source` | `utm_source` cookie (written by LoAttribution; URL param fallback) | ✅ yes | — | `TODO` (create: UTM Source) |
| `utm_medium` | `utm_medium` cookie | ✅ yes | — | `TODO` (create: UTM Medium) |
| `utm_campaign` | `utm_campaign` cookie | ✅ yes | — | `TODO` (create: UTM Campaign) |
| `utm_term` | `utm_term` cookie | ✅ yes | — | `TODO` (create: UTM Term) |
| `utm_content` | `utm_content` cookie | ✅ yes | — | `TODO` (create: UTM Content) |
| `umtid` | `umtid` URL param (cleaned) → `umtid` cookie fallback | ✅ yes (pre-existing field, unchanged) | `umtid` | existing `umtid` field (already mapped) |
| `loid` | `loid`/`lo_id`/`first_touch_loid` URL param → `first_touch_loid` cookie, resolved to the numeric NMLS-style id | ✅ yes (pre-existing field, unchanged) | — | existing `loid` field (already mapped) |
| `page_path` | `location.pathname` at submit time (GA4 only — not added to the webhook payload) | ❌ GA4 only | `page_path` | — |
| `profession` | that form's profession field if it has one, else `''` | ❌ GA4 only | `profession` | `TODO` if you later want it in the CRM |
| `county` | that form's county field if it has one (e.g. `state.loc_county` from Google Places, or the page's county for the USDA FL pages), else `''` | ❌ GA4 only | `county` | `TODO` if you later want it in the CRM |

### Notes on `profession` / `county`

`profession` and `county` are **GA4-only** segmentation params — they are NOT
added to the webhook payload (the forms already send richer, form-specific
fields such as `loc_county`, `professions`, `property_location`, etc.). They are
passed to `generate_lead` only when the submitting form actually has that data:

- **county** is populated on the mortgage funnels that capture a property
  address via Google Places (`state.loc_county`) — Purchase, Refinance,
  Renovation, HELOC, New Construction, Reverse, Real Reverse — and on the USDA
  FL county pages (the page's own county). All other forms send `''`.
- **profession** is `''` on every current form (no form collects a single
  "profession" field; the partner/advisor forms use their own multi-select
  `professions` / `partner_type` fields, which already ship in the payload).
  The `generate_lead` call is wired to read `data.profession || data.professions`
  where a FormData object exists, so if a form later adds a `profession` field it
  will flow through automatically.

## GA4 event contract

Fired once per successful submission, after `response.ok`:

```js
gtag('event', 'generate_lead', {
  page_path: location.pathname,
  profession: '<from form or ''>',
  county: '<from form or ''>',
  umtid: '<canonical umtid>'
});
```

**No PII** is ever sent to GA4 — no email, phone, or name. Failures are logged
via `console.warn` (never swallowed silently) and never fire `generate_lead`.

## Where the helper lives

- `src/lib/lead-attribution.js` — the one function + the GA4 helper.
- Included once per page via `Layout.astro` / `LandingLayout.astro`
  (`<script is:inline set:html={leadAttributionSrc}>`), so it is globally
  available to every inline form script.
- `LoAttribution.astro` — unchanged; it remains the only place cookies are
  written.

## Forms NOT wired for lead attribution (by design)

These submit paths are intentionally excluded — they are not consumer lead
submissions:

- `src/pages/rating.astro` — negative-feedback / review-gating box. Posts to a
  dedicated feedback webhook with no name/email; not a CRM lead.
- `src/pages/index.astro` — the AI concierge posts to the server endpoint
  `/api/chat/`; lead capture happens server-side there, not via a client GHL
  webhook. Attribution for that path belongs in the API, not the page.
- `src/pages/relocate-anywhere.astro` — only performs a geocode utility fetch;
  its lead capture is handled by shared funnel components (already wired).
