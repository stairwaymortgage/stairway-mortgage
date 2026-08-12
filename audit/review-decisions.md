# REVIEW Decisions — 58 URLs needing manual confirmation

All 58 are `/loan-calculator/*` sub-pages that existed on WP but not on the new site.
The new site has a `/loan-calculator/` hub with 110+ calculators — these 58 are old
variants (purchase-specific, refinance-specific, etc.) that were consolidated.

**Recommendation key**: 301 = redirect to closest match; LET-DIE = low value, redirect to hub.

| # | old_url | proposed_match | confidence | call | reason |
|---|---------|---------------|------------|------|--------|
| 1 | `/loan-calculator/1031-exchange/` | `/loan-calculator/1031-exchange-calculator/` | 0.9 | 301 | Exact equivalent exists with `-calculator` suffix |
| 2 | `/loan-calculator/amortization-calculator-with-extra-payments/` | `/loan-calculator/mortgage-payoff-calculator-with-extra-payments/` | 0.8 | 301 | Same functionality, renamed |
| 3 | `/loan-calculator/bridge-loans-tax-savings-recasting/` | `/loan-calculator/bridge-loan/` | 0.7 | 301 | Bridge loan calc exists; tax savings variant merged |
| 4 | `/loan-calculator/build-to-sell-spec-home-calculator-acquire-build/` | `/loan-calculator/build-to-sell/` | 0.8 | 301 | Consolidated into single build-to-sell calc |
| 5 | `/loan-calculator/build-to-sell-spec-home-calculator-preowned-tear-down/` | `/loan-calculator/build-to-sell/` | 0.8 | 301 | Consolidated into single build-to-sell calc |
| 6 | `/loan-calculator/buy-hold-real-estate-wealth-building/` | `/loan-calculator/rental-property-calculator/` | 0.7 | 301 | Closest investment calc equivalent |
| 7 | `/loan-calculator/cap-rate-calculator/` | `/loan-calculator/debt-service-coverage-ratio-calculator/` | 0.6 | 301 | Related investor calc; no exact cap-rate exists |
| 8 | `/loan-calculator/capital-gains-calculator/` | `/loan-calculator/net-proceeds-calculator/` | 0.6 | 301 | Net proceeds is closest financial calc |
| 9 | `/loan-calculator/college-housing-costs-vs-investment-property/` | `/loan-calculator/college-costs-calculator/` | 0.8 | 301 | College calc exists, consolidated |
| 10 | `/loan-calculator/construction-to-perm-loan/` | `/loan-calculator/conventional-construction-loan/` | 0.8 | 301 | Construction-to-perm = conventional construction |
| 11 | `/loan-calculator/conventional-loan-purchase/` | `/loan-calculator/conventional-loan/` | 0.9 | 301 | Purchase variant merged into main conv calc |
| 12 | `/loan-calculator/conventional-new-construction-loan/` | `/loan-calculator/conventional-construction-loan/` | 0.9 | 301 | Same product, renamed |
| 13 | `/loan-calculator/dscr-cash-out-refinance-loan/` | `/loan-calculator/dscr-loan/` | 0.8 | 301 | DSCR variants consolidated |
| 14 | `/loan-calculator/dscr-purchase-loan/` | `/loan-calculator/dscr-loan/` | 0.8 | 301 | DSCR variants consolidated |
| 15 | `/loan-calculator/dscr-refinance-loan/` | `/loan-calculator/dscr-loan-refinance/` | 0.9 | 301 | Exact refi variant exists |
| 16 | `/loan-calculator/fannie-mae-homestyle-purchase-loan/` | `/loan-calculator/homestyle-renovation-loan/` | 0.9 | 301 | HomeStyle purchase = HomeStyle renovation loan |
| 17 | `/loan-calculator/fannie-mae-homestyle-renovation-refinance-loan/` | `/loan-calculator/homestyle-renovation-loan-refinance/` | 0.9 | 301 | Exact refi variant exists |
| 18 | `/loan-calculator/fha-203k-renovation-loan-purchase/` | `/loan-calculator/fha-203k-loan/` | 0.9 | 301 | 203k purchase variant merged |
| 19 | `/loan-calculator/fha-203k-renovation-refinance-loan/` | `/loan-calculator/fha-203k-loan-refinance/` | 0.9 | 301 | Exact refi variant exists |
| 20 | `/loan-calculator/fha-cash-out-refinance-loan/` | `/loan-calculator/fha-loan-cash-out-refinance/` | 0.9 | 301 | Exact equivalent, different slug order |
| 21 | `/loan-calculator/fha-multiunit-purchase/` | `/loan-calculator/fha-loan-multifamily/` | 0.9 | 301 | Multiunit = multifamily |
| 22 | `/loan-calculator/fha-new-construction-loan-purchase/` | `/loan-calculator/fha-construction-loan/` | 0.9 | 301 | FHA construction = FHA new construction |
| 23 | `/loan-calculator/fha-purchase-loan/` | `/loan-calculator/fha-loan/` | 0.9 | 301 | Purchase variant merged into main FHA calc |
| 24 | `/loan-calculator/fha-streamline-refinance-loan/` | `/loan-calculator/fha-streamline-refinance/` | 0.9 | 301 | Near-identical slug |
| 25 | `/loan-calculator/fix-flip-loan/` | `/loan-calculator/fix-and-flip-loan/` | 0.9 | 301 | Shortened variant of existing calc |
| 26 | `/loan-calculator/heloc-loan-payment/` | `/loan-calculator/heloc/` | 0.9 | 301 | HELOC calc exists, variant slug |
| 27 | `/loan-calculator/how-to-use-the-brrrr-method/` | `/loan-calculator/brrrr-method/` | 0.9 | 301 | Exact equivalent, shorter slug |
| 28 | `/loan-calculator/investment-growth/` | `/loan-calculator/investment-growth-calculator/` | 0.95 | 301 | Exact match with `-calculator` suffix |
| 29 | `/loan-calculator/jumbo-cash-out-refinance-loan/` | `/loan-calculator/jumbo-loan-cash-out-refinance/` | 0.9 | 301 | Same product, different slug order |
| 30 | `/loan-calculator/jumbo-construction-and-land-acquisition/` | `/loan-calculator/jumbo-construction-loan/` | 0.8 | 301 | Jumbo construction variant |
| 31 | `/loan-calculator/jumbo-construction-to-permanent-loan/` | `/loan-calculator/jumbo-construction-loan/` | 0.8 | 301 | Construction-to-perm = construction loan |
| 32 | `/loan-calculator/jumbo-new-construction-loan/` | `/loan-calculator/jumbo-construction-loan/` | 0.9 | 301 | Same product, renamed |
| 33 | `/loan-calculator/jumbo-purchase-loan-payment/` | `/loan-calculator/jumbo-loan/` | 0.9 | 301 | Purchase variant merged |
| 34 | `/loan-calculator/jumbo-refinance-rate-reduction/` | `/loan-calculator/jumbo-loan-refinance/` | 0.9 | 301 | Refi variant exists |
| 35 | `/loan-calculator/jumbo-renovation-purchase-loan/` | `/loan-calculator/jumbo-loan-purchase-renovation/` | 0.9 | 301 | Exact equivalent, different slug order |
| 36 | `/loan-calculator/jumbo-renovation-refinance-loan/` | `/loan-calculator/jumbo-loan-renovation-refinance/` | 0.9 | 301 | Exact equivalent, different slug order |
| 37 | `/loan-calculator/legacy-impact-planner/` | `/loan-calculator/legacy-planning-calculator/` | 0.8 | 301 | Legacy planning calc exists |
| 38 | `/loan-calculator/my-spiritual-impact/` | `/loan-calculator/spiritual-influence-calculator/` | 0.8 | 301 | Spiritual calc exists, renamed |
| 39 | `/loan-calculator/passive-investment-return-calculator/` | `/loan-calculator/passive-income-calculator/` | 0.8 | 301 | Passive income calc exists |
| 40 | `/loan-calculator/reverse-mortgage-home-purchase-loan-calculator/` | `/loan-calculator/reverse-mortgage/` | 0.8 | 301 | Reverse mortgage purchase variant merged |
| 41 | `/loan-calculator/reverse-mortgage-income-for-life-calculator/` | `/loan-calculator/reverse-mortgage-income/` | 0.9 | 301 | Exact equivalent exists |
| 42 | `/loan-calculator/reverse-mortgage-legacy-inheritance-estimator/` | `/loan-calculator/reverse-mortgage-legacy/` | 0.9 | 301 | Exact equivalent exists |
| 43 | `/loan-calculator/side-hustle-income-calculator/` | `/loan-calculator/passive-income-calculator/` | 0.6 | 301 | Closest income calc |
| 44 | `/loan-calculator/spec-home-calculator-preowned-tear-down/` | `/loan-calculator/spec-home-loan-acquisition-and-development/` | 0.7 | 301 | Spec home calc exists |
| 45 | `/loan-calculator/spec-home-loan-preowned-teardown-calculator/` | `/loan-calculator/spec-home-loan-acquisition-and-development/` | 0.7 | 301 | Spec home calc exists (dupe of #44) |
| 46 | `/loan-calculator/total-loan-cost-calculator/` | `/loan-calculator/compare-3-rate-payments-total-costs/` | 0.7 | 301 | Total cost comparison calc closest |
| 47 | `/loan-calculator/usda-cash-out-refinance/` | `/loan-calculator/usda-loan-cash-out-refinance/` | 0.9 | 301 | Exact equivalent, different slug |
| 48 | `/loan-calculator/usda-home-purchase-loan/` | `/loan-calculator/usda-loan/` | 0.9 | 301 | Purchase variant merged |
| 49 | `/loan-calculator/usda-refinance-interest-rate-reduction/` | `/loan-calculator/usda-loan-refinance/` | 0.9 | 301 | USDA refi exists |
| 50 | `/loan-calculator/va-cash-out-refinance/` | `/loan-calculator/va-loan-cash-out-refinance/` | 0.9 | 301 | Exact equivalent |
| 51 | `/loan-calculator/va-entitlement/` | `/loan-calculator/va-high-balance-loan/` | 0.6 | 301 | VA entitlement closest to high-balance |
| 52 | `/loan-calculator/va-high-balance-purchase-loan/` | `/loan-calculator/va-high-balance-loan/` | 0.9 | 301 | Purchase variant merged |
| 53 | `/loan-calculator/va-irrrl-refinance/` | `/loan-calculator/va-irrrl/` | 0.95 | 301 | Exact equivalent, shorter slug |
| 54 | `/loan-calculator/va-loan-entitlement-calculator/` | `/loan-calculator/va-high-balance-loan/` | 0.6 | 301 | Entitlement → high-balance (closest) |
| 55 | `/loan-calculator/va-new-construction-loan/` | `/loan-calculator/va-construction-loan/` | 0.9 | 301 | Same product, renamed |
| 56 | `/loan-calculator/va-purchase-loan-payment/` | `/loan-calculator/va-loan/` | 0.9 | 301 | Purchase variant merged |
| 57 | `/loan-calculator/va-renovation-purchase-loan/` | `/loan-calculator/va-loan-purchase-renovation/` | 0.9 | 301 | Exact equivalent |
| 58 | `/loan-calculator/va-renovation-refinance-loan/` | `/loan-calculator/va-loan-refinance-renovation/` | 0.9 | 301 | Exact equivalent |

## Summary

All 58 REVIEW items are old calculator sub-page variants that map to consolidated
calculators on the new site. **Recommendation: 301 all 58** to their closest match.
None warrant REBUILD or LET-DIE — they all have clear calculator equivalents.
