/**
 * GHL webhook test ping.
 * Sends ONE sample payload so GHL's "Fetch sample requests" can learn the fields.
 *
 * Run:  node scripts/ghl-test-ping.mjs
 *
 * Includes the full superset of standard fields we expect to use across
 * the site, so GHL sees and can map every one of them in the mapping step.
 */

const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/ipRIuBMrlyPNaFSXDz3q/webhook-trigger/a6df65f7-be5d-4e36-9df9-58986dc33417";

const samplePayload = {
  form_source: "test-ping",
  form_name: "Webhook Field-Learning Ping",
  first_name: "Test",
  last_name: "Lead",
  full_name: "Test Lead",
  email: "test.lead@example.com",
  phone: "+19549931625",
  loan_purpose: "Purchase",
  loan_amount: "450000",
  property_state: "FL",
  message: "This is a field-learning ping from the Stairway website.",
  page_url: "https://stairway-vercel.vercel.app/test-ping/",
  submitted_at: new Date().toISOString(),
};

const res = await fetch(GHL_WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(samplePayload),
});

console.log("Status:", res.status, res.statusText);
console.log("Sent payload:");
console.log(JSON.stringify(samplePayload, null, 2));
