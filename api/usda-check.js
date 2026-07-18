// /api/usda-check.js — Vercel Serverless Function (Node 18+)
// Queries USDA's official SFH eligibility layer server-side (no browser CORS limits).
// The widget sends lat/lon (it already geocodes); this returns ELIGIBLE / INELIGIBLE / UNKNOWN.
//
// GET  /api/usda-check?lat=29.8&lon=-82.6
// POST /api/usda-check  {lat, lon, address?, county?, name?, phone?, source_url?, umtid?}
//      → also forwards the lead to the GHL webhook when name/phone present.
//
// USDA layer notes: the SFH "ineligible areas" polygons — a point INSIDE a polygon
// is INELIGIBLE; outside all polygons is ELIGIBLE. Endpoint verified against the
// same service that powers eligibility.sc.egov.usda.gov. If USDA renames the
// service (they occasionally do), update USDA_ENDPOINTS — the function tries each
// in order and reports UNKNOWN rather than guessing.

const USDA_ENDPOINTS = [
  // primary — SFH property eligibility (ineligible-area polygons), layer 1
  "https://gis.sc.egov.usda.gov/arcgis/rest/services/eligibility/eligibility/MapServer/1/query",
  // fallbacks — alternate hosts USDA has used
  "https://eligibility.sc.egov.usda.gov/arcgis/rest/services/eligibility/eligibility/MapServer/1/query",
  "https://gis.rd.usda.gov/arcgis/rest/services/eligibility/eligibility/MapServer/1/query",
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
      if (!r.ok) continue;
      const j = await r.json();
      if (Array.isArray(j.features)) {
        return j.features.length > 0 ? "INELIGIBLE" : "ELIGIBLE";
      }
    } catch (_) { /* try next endpoint */ }
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
