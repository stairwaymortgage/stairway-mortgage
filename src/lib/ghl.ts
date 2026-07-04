/**
 * Stairway Mortgage — GHL lead submission helper
 * ------------------------------------------------
 * Single source of truth for the GHL inbound webhook.
 * Every form on the site submits through submitToGHL().
 *
 * If the webhook URL ever changes, change it HERE ONLY.
 *
 * The webhook is WRITE-ONLY (it can only receive data, never read),
 * so it is safe to ship in the static client bundle.
 *
 * Routing per form happens INSIDE GHL: every payload carries
 * `form_source`, and the GHL workflow branches/tags on that value.
 */

export const GHL_WEBHOOK_URL =
  "https://services.leadconnectorhq.com/hooks/ipRIuBMrlyPNaFSXDz3q/webhook-trigger/fd7a3b30-ddf9-4415-b751-bfa88beda702";

/**
 * Dedicated webhook for /the-drawing ONLY — routes to its own GHL workflow,
 * separate from the shared GHL_WEBHOOK_URL above. Do NOT use for other forms.
 */
export const GHL_WEBHOOK_THE_DRAWING =
  "https://services.leadconnectorhq.com/hooks/ipRIuBMrlyPNaFSXDz3q/webhook-trigger/63810884-486d-4190-a2cd-af9c63ef8e63";

/** Standard fields every form sends, plus arbitrary form-specific fields. */
export interface LeadPayload {
  /** Which form this came from, e.g. "same-day-approval". REQUIRED — drives GHL routing. */
  form_source: string;
  /** Human-readable name of the form, e.g. "Same-Day Approval Request". */
  form_name?: string;

  // Common contact fields (GHL maps these to standard contact fields)
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;

  // Anything else (loan amount, profession, quiz answers, etc.)
  [key: string]: string | number | boolean | null | undefined;
}

export interface SubmitResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Submit a lead to GHL.
 * - Silently drops bot submissions (honeypot `_gotcha` filled).
 * - Adds page_url + submitted_at automatically.
 * - Returns {ok:true} on 2xx, otherwise {ok:false, error}.
 */
export async function submitToGHL(
  payload: LeadPayload,
  honeypotValue = ""
): Promise<SubmitResult> {
  // Honeypot: real users never fill this. If filled, fake success and bail.
  if (honeypotValue && honeypotValue.trim() !== "") {
    return { ok: true };
  }

  const body = {
    ...payload,
    page_url: typeof window !== "undefined" ? window.location.href : "",
    submitted_at: new Date().toISOString(),
  };

  try {
    const res = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, status: res.status };
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

/** Minimal shared validators (use in each form's submit handler). */
export const validators = {
  email: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v: string) => v.replace(/\D/g, "").length >= 10,
  required: (v: string) => v.trim().length > 0,
};
