// /api/usda-check.js — Vercel Serverless Function (Node 18+)
// Queries USDA's official SFH eligibility layer server-side (no browser CORS limits).
// The widget sends lat/lon (it already geocodes); this returns ELIGIBLE / INELIGIBLE / UNKNOWN.
//
// GET  /api/usda-check?lat=29.8&lon=-82.6
// POST /api/usda-check  {lat, lon, address?, county?, name?, phone?, source_url?, umtid?}
//      → also forwards the lead to the GHL webhook when name/phone present.
//
// USDA layer notes: the RHS Single Family Housing "ineligible areas" polygons — a
// point INSIDE a polygon is INELIGIBLE; outside all polygons is ELIGIBLE. This is the
// same service that powers the current USDA eligibility map (the ArcGIS Experience app
// linked from eligibility.sc.egov.usda.gov). Verified live 2026-07-18: Troy MI
// (42.605,-83.12) → 1 feature → INELIGIBLE; rural Alachua FL (29.83,-82.60) → 0 → ELIGIBLE.
// LAYER 4 = "RHS SFH MFH" is the correct layer (layer 1 on this service is "ELEC").
// If USDA renames the service (they occasionally do), update USDA_ENDPOINTS — the
// function tries each in order and reports UNKNOWN rather than guessing.

const USDA_ENDPOINTS = [
  // primary — RHS SFH/MFH property eligibility (ineligible-area polygons), layer 4
  "https://rdgdwe.sc.egov.usda.gov/arcgis/rest/services/Eligibility/Eligibility/MapServer/4/query",
];

const GHL_WEBHOOK = process.env.GHL_ADDRESS_CHECKER_WEBHOOK || ""; // set in Vercel env

async function queryUsda(lat, lon) {
  const params = new URLSearchParams({
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "false",
    outFields: "*",
    f: "json",
  });
  for (const ep of USDA_ENDPOINTS) {
    try {
      const r = await fetch(`${ep}?${params}`, {
        headers: { "User-Agent": "Mozilla/5.0 (StairwayMortgage eligibility check)" },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) {
        console.log(`[usda-check] upstream HTTP ${r.status} (non-ok) from ${ep} — skipping`);
        continue;
      }
      const j = await r.json();
      if (Array.isArray(j.features)) {
        const result = j.features.length > 0 ? "INELIGIBLE" : "ELIGIBLE";
        console.log(`[usda-check] upstream HTTP ${r.status}, features=${j.features.length} → ${result}`);
        return result;
      }
      // 200 but not the expected shape — usually an ArcGIS {"error":{...}} body. Log it, don't guess.
      console.log(`[usda-check] upstream HTTP ${r.status} but no features array — ${JSON.stringify(j.error || j).slice(0, 200)}`);
    } catch (e) {
      console.log(`[usda-check] upstream fetch failed for ${ep}: ${(e && e.name) || "Error"} ${(e && e.message) || ""}`);
    }
  }
  return "UNKNOWN";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://stairwaymortgage.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const src = req.method === "POST" ? (req.body || {}) : (req.query || {});
  const lat = parseFloat(src.lat), lon = parseFloat(src.lon);
  if (!isFinite(lat) || !isFinite(lon) || lat < 24 || lat > 50 || lon < -125 || lon > -66) {
    return res.status(400).json({ error: "valid US lat/lon required" });
  }

  const result = await queryUsda(lat, lon);
  console.log(`[usda-check] method=${req.method} lat=${lat} lon=${lon} → result=${result}`);

  // Lead forwarding (only when contact info present)
  if (req.method === "POST" && src.phone && GHL_WEBHOOK) {
    try {
      await fetch(GHL_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: src.name || "",
          phone: src.phone,
          address: src.address || "",
          latitude: lat, longitude: lon,
          usda_prelim_result: result,
          county: src.county || "",
          source_url: src.source_url || "",
          umtid: src.umtid || "",
          tag: "usda address checker",
        }),
        signal: AbortSignal.timeout(6000),
      });
    } catch (_) { /* never let GHL failure break the user's answer */ }
  }

  res.setHeader("Cache-Control", "s-maxage=86400"); // same point, same answer for a day
  return res.status(200).json({ result, lat, lon, checked: new Date().toISOString() });
}
