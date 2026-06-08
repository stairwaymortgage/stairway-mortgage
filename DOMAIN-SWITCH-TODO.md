# DOMAIN-SWITCH TODO — Forms Workstream

**Context:** The site currently lives at `stairway-vercel.vercel.app`. It WILL switch to the
production domain `stairwaymortgage.com` (Cloudflare DNS → Vercel). Everything below is built
to be **domain-agnostic** so the switch is low-risk. This file lists anything that still
touches the domain and must be checked/changed at switch time.

> RULE: Build everything domain-agnostic NOW. Add to this list anything that can't be.
> Jim does these items only AT the domain switch — they are safe to leave until then.

---

## ✅ Already domain-agnostic (no action needed at switch)

- **GHL webhook URL** — points at `services.leadconnectorhq.com`, not our domain. Unaffected by switch.
- **Form submission (`submitToGHL`)** — POSTs to the GHL webhook directly; no origin dependency.
- **`page_url` / `source_url` in payloads** — captured at runtime via `window.location.href`,
  so they automatically report the correct domain after switch. No change needed.
- **Form components themselves** — use relative asset paths and runtime origin. Portable.
- **LO/UTM attribution reading** — reads from `window.location.search` + cookies at runtime. Portable.

---

## ⚠️ MUST CHECK / CHANGE AT DOMAIN SWITCH

> (None of these block shipping forms now. They are switch-time items.)

1. **OTP serverless callback / API route base URL** (when OTP is built)
   - If the OTP flow uses any absolute callback URL or an allowed-origin/CORS allowlist,
     it must include `stairwaymortgage.com`. Build it to read origin dynamically; if any
     provider (Twilio / GHL verify) requires a registered domain or webhook callback,
     **register stairwaymortgage.com** at switch time.
   - Twilio (if used): update any messaging-service / webhook callback URLs to the new domain.

2. **GHL "allowed origins" / form-domain allowlist** (if GHL enforces one)
   - If GHL restricts which domains may POST to the webhook (some setups do via referrer/CORS),
     add `stairwaymortgage.com` at switch time. Currently posting from vercel.app works.

3. **Privacy Policy / Terms links in forms**
   - Forms link to `/privacy-policy/` and `/terms-of-service/` (RELATIVE — good, no change).
   - Just confirm those pages exist on the production domain post-switch.

4. **Any analytics / GTM container domain config**
   - The old GTM populated LO cookies based on the LO share-link domain. When LOs go live,
     their share links must use `stairwaymortgage.com`, and GTM/cookie domain scoping must
     target `.stairwaymortgage.com` (not vercel.app) so the LO cookie persists across the site.

5. **Test submissions / lead source hygiene**
   - Re-run a live test submission AFTER the switch from `stairwaymortgage.com` to confirm
     the chain still lands in GHL from the production origin.

---

## NOTES
- This list is also mirrored at a high level in Claude's project memory so every chat knows.
- Add any new domain-coupled item here the moment it's introduced.
