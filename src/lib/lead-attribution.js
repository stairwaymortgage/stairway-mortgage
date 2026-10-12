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
})();
