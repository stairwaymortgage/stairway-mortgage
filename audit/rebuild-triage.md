# REBUILD Triage — 174 URLs (404, no redirect match)

No per-URL GSC impression/click data available — the GSC exports contain only
summary-level counts by reason (e.g. "Not found (404): 101 pages"), not
individual URL performance. Triage is based on content value and SEO potential.

---

## Bucket 1: FAQ Articles (100 URLs) — **301 to `/blog/` hub**

These are thin "what-is-X" / "how-does-X-work" FAQ pages from the old WP site.
Most are auto-generated content with minimal unique value. The new blog already
covers many of these topics in richer long-form articles.

| # | URL | Recommendation |
|---|-----|---------------|
| 1 | `/how-do-i-determine-my-homes-value/` | 301 → `/blog/` |
| 2 | `/how-do-i-find-a-great-real-estate-agent/` | 301 → `/blog/` |
| 3 | `/how-do-i-get-rid-of-pmi/` | 301 → `/blog/` |
| 4 | `/how-do-i-know-if-im-ready-to-buy-a-home/` | 301 → `/blog/` |
| 5 | `/how-do-i-make-an-offer-on-a-home/` | 301 → `/blog/` |
| 6–100 | *(94 more what-is/how-does/what-should pages)* | 301 → `/blog/` |

**Call**: 301 all 100 → `/blog/`. Not worth rebuilding individually — the blog
hub captures these visitors and has richer content. If any specific FAQ topic
later shows GSC demand, it can be written as a proper blog post.

---

## Bucket 2: Misc (38 URLs) — **Mixed: 301-to-hub / LET-DIE**

| # | URL | Call | Target |
|---|-----|------|--------|
| 1 | `/about-us/` | 301 | `/` (homepage has about content) |
| 2 | `/buy-a-house/` | 301 | `/the-8-steps/first-time-buyer/` |
| 3 | `/buy-now-or-wait/` | 301 | `/blog/` |
| 4 | `/buying-a-home-or-investment/` | 301 | `/the-8-steps/` |
| 5 | `/calculators/` | 301 | `/loan-calculators/` |
| 6 | `/cash-out-refi-upgrade-invest-or-consolidate/` | 301 | `/blog/` |
| 7 | `/comfort-vs-cash-flow-decision-matrix/` | 301 | `/blog/` |
| 8 | `/get-a-local-intro/` | 301 | `/get-a-local-introduction/` |
| 9 | `/home-loan-timeline/` | 301 | `/blog/` |
| 10 | `/house-hack-property-analyzer/` | 301 | `/loan-calculator/brrrr-method/` |
| 11 | `/mortgage-application-101/` | 301 | `/blog/` |
| 12 | `/mortgage-pre-approval/` | 301 | `https://stairwaymortgage.my1003app.com/` |
| 13 | `/mortgage-rate-shopping-broker-vs-banker/` | 301 | `/fl/fort-lauderdale/mortgage-broker/` |
| 14 | `/new-construction-vs/` | 301 | `/blog/` |
| 15 | `/now-a-direct-lender/` | 301 | `/fl/fort-lauderdale/mortgage-lender/` |
| 16 | `/pre-qualified-vs-preapproved/` | 301 | `/blog/` |
| 17 | `/purchase-process-guidance/` | 301 | `/the-8-steps/first-time-buyer/` |
| 18 | `/real-estate-appreciation/` | 301 | `/blog/` |
| 19 | `/real-estate-vision-board/` | 301 | `/blog/` |
| 20 | `/refi-today-build-wealth-for-tomorrow/` | 301 | `/blog/` |
| 21 | `/refinance-savings/` | 301 | `/blog/` |
| 22 | `/renovate-a-house/` | 301 | `/blog/` |
| 23 | `/sell-a-house/` | 301 | `/blog/` |
| 24 | `/sell-a-house2/` | LET-DIE | Draft/copy, no value |
| 25 | `/stairway-process/` | 301 | `/the-8-steps/` |
| 26 | `/things-you-need-for-a-new-home-first-time-buyer-essentials/` | 301 | `/blog/` |
| 27 | `/top-5-reasons-mortgage-broker-vs-bank/` | 301 | `/fl/fort-lauderdale/mortgage-broker/` |
| 28 | `/what-documents-do-i-need-for-a-mortgage/` | 301 | `/blog/` |
| 29 | `/why-mortgage-brokers-beat-banks-on-rate-shopping/` | 301 | `/fl/fort-lauderdale/mortgage-broker/` |
| 30 | `/why-most-homeowners-miss-out-on-big-savings/` | 301 | `/blog/` |
| 31 | `/your-refinance-team-what-each-expert-does/` | 301 | `/blog/` |
| 32 | `/0-approval_2/` | LET-DIE | Test/draft page |
| 33 | `/master-lead-form/` | LET-DIE | Internal form, not public |
| 34 | `/master-lead-form-2/` | LET-DIE | Internal form, not public |
| 35 | `/welcome-can-we-help-you-refinance-smarter-copy/` | LET-DIE | Draft/copy page |
| 36 | `/welcome-can-we-help-you-refinance-smarter-copy-2/` | LET-DIE | Draft/copy page |

**Call**: 301 most to nearest hub (blog, 8-steps, calculators, broker page).
LET-DIE the 4 obvious drafts/internal pages.

---

## Bucket 3: Reverse Mortgage Articles (19 URLs) — **301 to `/reverse-mortgage/`**

The new site has a dedicated `/reverse-mortgage/` page. These were individual
WP articles that should redirect to that hub.

| # | URL |
|---|-----|
| 1 | `/can-you-buy-a-home-with-a-reverse-mortgage-yes-heres-how/` |
| 2 | `/common-reverse-mortgage-myths-debunked-with-real-facts/` |
| 3 | `/how-adult-children-can-help-parents-navigate-a-reverse-mortgage/` |
| 4 | `/how-does-a-reverse-mortgage-work/` |
| 5 | `/how-much-can-you-actually-get-from-a-reverse-mortgage/` |
| 6 | `/how-to-use-a-reverse-mortgage-for-aging-in-place-without-compromise/` |
| 7 | `/how-to-use-a-reverse-mortgage-to-preserve-wealth-not-just-access-it/` |
| 8 | `/reverse-mortgage-college-planning/` |
| 9 | `/reverse-mortgage-purchase/` |
| 10 | `/reverse-mortgages-charitable-giving-a-new-way-to-leave-a-legacy/` |
| 11 | `/reverse-mortgages-for-real-estate-agents-protect-listings-serve-better/` |
| 12 | `/reverse-mortgages-in-financial-planning-what-every-advisor-must-know/` |
| 13 | `/reverse-mortgages-in-financial-planning-what-every-advisor-should-know/` |
| 14 | `/reverse-mortgages-retirement-stretching-income-without-selling/` |
| 15 | `/the-5-biggest-mistakes-seniors-make-with-reverse-mortgages/` |
| 16 | `/what-happens-to-a-reverse-mortgage-when-you-pass-away/` |
| 17 | `/what-is-a-reverse-mortgage-and-is-it-right-for-you/` |
| 18 | `/what-is-a-reverse-mortgage-and-is-it-right-for-you-copy/` |
| 19 | `/who-qualifies-for-a-reverse-mortgage-and-who-doesnt/` |
| 20 | `/will-i-still-own-my-home-with-a-reverse-mortgage/` |

**Call**: 301 all → `/reverse-mortgage/`. Consider building these as blog
posts later if reverse mortgage SEO is a priority — these are strong
long-tail keywords.

---

## Bucket 4: Guides & Toolkits (11 URLs) — **301 to `/guides/`**

| # | URL |
|---|-----|
| 1 | `/build-your-dream-team-guide/` |
| 2 | `/family-planning-inheritance-guide/` |
| 3 | `/fixed-vs-arm-comparison-worksheet/` |
| 4 | `/guides-3/` |
| 5 | `/leverage-to-wealth-tracker/` |
| 6 | `/living-trust-setup-checklist/` |
| 7 | `/low-down-payment-cheat-sheet/` |
| 8 | `/mortgage-credit-boosting-toolkit/` |
| 9 | `/mortgage-myths-debunked-guide/` |
| 10 | `/step-up-in-basis-explainer/` |
| 11 | `/term-life-mortgage-protection-planner/` |

**Call**: 301 all → `/guides/`. The guides hub exists and covers these topics.

---

## Bucket 5: Profile Pages (7 URLs) — **Mixed: 301 / LET-DIE**

| # | URL | Call | Target |
|---|-----|------|--------|
| 1 | `/jim-blackburn-mortgage-broker/` | 301 | `/jim-blackburn-mortgage/` |
| 2 | `/miami-fort-lauderdale-jim-blackburn/` | 301 | `/branches/fort-lauderdale/jim-blackburn-team/` |
| 3 | `/miami-jim-blackburn/` | 301 | `/branches/fort-lauderdale/jim-blackburn-team/` |
| 4 | `/find-broker/` | 301 | `/branches/fort-lauderdale/` |
| 5 | `/professions/` | 301 | `/` |
| 6 | `/adam/` | LET-DIE | Old officer page, person likely no longer active |
| 7 | `/kerry-white/` | LET-DIE | Old officer page, person likely no longer active |

---

## Bucket 6: Quizzes (4 URLs) — **301 to `/discovery-quiz/`**

| # | URL |
|---|-----|
| 1 | `/buyer-identity-quiz-homeowner-vs-investor/` |
| 2 | `/sfr-vs-multifamily-matchmaker-quiz/` |
| 3 | `/smart-student-quiz/` |
| 4 | `/buy-a-house-copied-from-smart-parents-smart-students/` |

**Call**: 301 all → `/discovery-quiz/`. The discovery quiz consolidates these.

---

## Bucket 7: Case Studies (4 URLs) — **301 to `/case-studies/`**

| # | URL |
|---|-----|
| 1 | `/case-studies-1/` |
| 2 | `/case-studies-2/` |
| 3 | `/case-studies-3/` |
| 4 | `/client-stories/` |

**Call**: 301 all → `/case-studies/`. The case studies hub exists.

---

## Bucket 8: Journeys (2 URLs) — **301 to `/the-8-steps/`**

| # | URL |
|---|-----|
| 1 | `/rent-a-home-journey/` |
| 2 | `/smart-college-planning-journey/` |

**Call**: 301 → `/the-8-steps/`. Journey pages consolidated into 8-steps hub.

---

## Summary by Bucket

| Bucket | Count | Recommendation |
|--------|-------|---------------|
| FAQ articles | 100 | 301 → `/blog/` |
| Misc | 38 | 301 to nearest hub (32) / LET-DIE (6) |
| Reverse mortgage | 20 | 301 → `/reverse-mortgage/` |
| Guides & toolkits | 11 | 301 → `/guides/` |
| Profile pages | 7 | 301 (5) / LET-DIE (2) |
| Quizzes | 4 | 301 → `/discovery-quiz/` |
| Case studies | 4 | 301 → `/case-studies/` |
| Journeys | 2 | 301 → `/the-8-steps/` |
| **Total** | **174** | **301: 166 / LET-DIE: 8** |

**Net**: If Jim approves, add 166 more redirects (mostly hub-level, not
individual matches). Combined with the 156 validated + 58 REVIEW-now-301,
total new redirects = ~380. Current 272 + 380 = 652, still under 1,024.
