/**
 * lead-attribution.js — single source of truth for lead attribution + GA4 lead event.
 * ---------------------------------------------------------------------------------
 * Every form on the site enriches its submit payload with the SAME canonical set of
 * attribution fields, and fires the SAME GA4 `generate_lead` event on success, by
 * going through the two globals installed here. This keeps 35+ form submit paths in
 * lockstep and makes the Goat Genie / future-CRM field mapping a one-file change.
 *
 * It READS the cookies written by LoAttribution.astro — it never writes them:
 *   - first_touch_url   → landing_page   (first-touch entry URL; falls back to current URL)
 *   - utm_source/_medium/_campaign/_term/_content → utm_* (last-touch, written by LoAttribution)
 *   - umtid             → umtid          (cleaned; URL param wins over cookie)
 *   - first_touch_loid  → loid           (numeric NMLS-style id; URL param wins over cookie)
 *
 * This file is authored as a classic (non-module) browser script with NO imports or
 * exports, so it can be inlined verbatim into the <head> of every page (see
 * Layout.astro / LandingLayout.astro, which include it via `?raw`). It installs:
 *   window.STW_leadAttribution()  → the canonical attribution object (step 1/2)
 *   window.STW_fireGenerateLead() → the GA4 generate_lead event      (step 3)
 *
 * The reading helpers below are the same ones the inline form scripts (and
 * LoAttribution.astro) already used — now centralized here.
 */
(function () {
  if (typeof window === "undefined") return;

  // ---- low-level readers (reused from the existing inline form helpers) ----
  function getCookie(name) {
    try {
      var m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
      return m ? decodeURIComponent(m[1]) : "";
    } catch (e) { return ""; }
  }
  function qs(name) {
    try { return new URL(location.href).searchParams.get(name) || ""; }
    catch (e) { return ""; }
  }
  function cleanUmtid(v) {
    return v ? String(v).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40) : "";
  }
  // utm_* : last-touch cookie written by LoAttribution; URL param as a safe fallback.
  function utm(key) { return getCookie(key) || qs(key) || ""; }
  // umtid : existing helper — URL param wins over cookie, then cleaned.
  function resolveUmtid() {
    return cleanUmtid(qs("umtid")) || cleanUmtid(getCookie("umtid")) || "";
  }
  // loid : existing first_touch_loid helper — resolve to the numeric id.
  function resolveLoid() {
    var raw = qs("loid") || qs("lo_id") || qs("first_touch_loid") || getCookie("first_touch_loid") || "";
    var m = String(raw).match(/(\d{3,})/);
    return m ? m[1] : "";
  }

  /**
   * The one canonical attribution object every form folds into its payload.
   * Keys are the exact snake_case names the Goat Genie custom fields expect.
   */
  function getLeadAttribution() {
    return {
      landing_page: getCookie("first_touch_url") || (typeof location !== "undefined" ? location.href : ""),
      utm_source:   utm("utm_source"),
      utm_medium:   utm("utm_medium"),
      utm_campaign: utm("utm_campaign"),
      utm_term:     utm("utm_term"),
      utm_content:  utm("utm_content"),
      umtid:        resolveUmtid(),
      loid:         resolveLoid()
    };
  }

  /**
   * Fire the GA4 `generate_lead` event. Call ONCE, only after a successful
   * (response.ok) webhook POST. Never sends PII (no email/phone/name).
   * @param {{profession?:string, county?:string, umtid?:string}} opts
   */
  function fireGenerateLead(opts) {
    opts = opts || {};
    try {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "generate_lead", {
        page_path: (typeof location !== "undefined" ? location.pathname : ""),
        profession: opts.profession || "",
        county: opts.county || "",
        umtid: opts.umtid || ""
      });
    } catch (e) { /* analytics must never break a submit */ }
  }

  window.STW_leadAttribution = getLeadAttribution;
  window.STW_fireGenerateLead = fireGenerateLead;

  // ---- source_url: the page the visitor was on BEFORE this one ------------------
  // Resolved once at page load (this script runs in <head> on every page):
  //   1) document.referrer (any page that linked here, other than this same URL)
  //   2) the last page this browser viewed on the site (localStorage)
  //   3) fallback in STW_sourceUrl(): the current page URL
  // Then the current page is recorded so the NEXT page can read it.
  var LAST_KEY = "stw_last_page";   // last page viewed on the site
  var PREV_KEY = "stw_last_prev";   // the page before that one (survives a reload)
  var here = "";
  try { here = location.href.split("#")[0]; } catch (e) {}
  var prev = "";
  try {
    var ref = document.referrer || "";
    if (ref && ref.split("#")[0] !== here) prev = ref;
  } catch (e) {}
  if (!prev) {
    try {
      var last = localStorage.getItem(LAST_KEY) || "";
      if (last && last !== here) prev = last;
      else if (last === here) prev = localStorage.getItem(PREV_KEY) || ""; // reload
    } catch (e) {}
  }
  try { localStorage.setItem(LAST_KEY, here); localStorage.setItem(PREV_KEY, prev); } catch (e) {}
  window.__STW_PREV_URL = prev;
  window.STW_sourceUrl = function () {
    return window.__STW_PREV_URL || (typeof location !== "undefined" ? location.href : "");
  };

  // ---- 1-Minute Check: remember who already completed it --------------------------
  // STW_markOmcDone() is called after a successful 1-Minute Check submit (site form or
  // homepage AI chat). On every later page load the <html> element gets the
  // `stw-omc-done` class, and CSS hides the floating button, inline bands and chat chips.
  // The class is only applied at page load, so the success screen the visitor is
  // looking at right after submitting is never hidden.
  var OMC_KEY = "stw_omc_done";
  function omcDone() {
    try { if (localStorage.getItem(OMC_KEY)) return true; } catch (e) {}
    return getCookie(OMC_KEY) === "1";
  }
  window.STW_markOmcDone = function () {
    try { localStorage.setItem(OMC_KEY, String(Date.now())); } catch (e) {}
    try { document.cookie = OMC_KEY + "=1; path=/; max-age=31536000; SameSite=Lax"; } catch (e) {}
  };
  window.STW_omcDone = omcDone;
  if (omcDone()) {
    try { document.documentElement.classList.add("stw-omc-done"); } catch (e) {}
  }
})();
