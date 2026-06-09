/**
 * Stairway Mortgage — Arive (my1003app / LendWize) external form URLs.
 * Single source of truth. If Arive ever changes a URL, change it HERE ONLY.
 *
 * These are EXTERNAL (Arive-hosted) — unaffected by the stairwaymortgage.com
 * domain switch. Links open in the SAME tab.
 */

export const ARIVE_URLS = {
  /** Lightweight inquiry / same-day / purchase-inquiry entry (no login wall). */
  inquiry: "https://stairwaymortgage.my1003app.com/agent/jimblackburn/inquiry",

  /** Full mortgage application portal root (visitor logs in / registers, then 1003). */
  apply: "https://stairwaymortgage.my1003app.com/",
} as const;
