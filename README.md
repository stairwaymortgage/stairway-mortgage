# Stairway Mortgage — Astro + Vercel

> Editorial-financial design system · *Leverage wisely. Grow wealthy.*

Built with **Astro 5** + **Tailwind CSS v4**. Targets Vercel for deployment. Static-first (zero JS by default), blazing fast.

---

## ✨ Design system

**Aesthetic direction:** Stripe-clean foundation + editorial gravitas (think Carta / Wealthfront) + financial precision. Distinctive without being decorative.

**Type system:**
- **Fraunces** (display) — warm serif with optical sizing, used for headings + editorial numbers
- **IBM Plex Sans** (body) — refined sans, engineering-precise feel
- **JetBrains Mono** (data) — for rates, NMLS numbers, timestamps

**Palette:**
| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#0A0E1A` | Warm near-black, primary text |
| `--color-paper` | `#FAFAF7` | Warm off-white background |
| `--color-paper-tint` | `#F4F2EC` | Section background |
| `--color-bone` | `#EAE7DE` | Dividers, card borders |
| `--color-blue` | `#1845D6` | Electric trust blue, accents |
| `--color-rust` | `#8B2C2C` | Editorial accent, testimonials |
| `--color-green` | `#2E9E2E` | Preserved brand CTA — Apply Now |

**Distinctive elements:**
- `editorial-number` — massive Fraunces display numbers for stats ($350M+, 300+, 08)
- Animated hairline links (background-size transition, not underline)
- Mega-menu with backdrop blur + soft border
- Asymmetric hero with rotated backdrop card
- Scroll-reveal staggered fade-ins (Intersection Observer, performant)

---

## 📁 Structure

```
stairway-vercel/
├── astro.config.mjs       Astro config (Tailwind via Vite plugin, sitemap)
├── package.json
├── vercel.json            Deploy config — cleanUrls, trailingSlash, cache headers
├── tsconfig.json
├── public/                Static assets (favicon, robots.txt)
└── src/
    ├── components/
    │   ├── Header.astro   4-dropdown mega-menu, sticky, glassmorphic
    │   └── Footer.astro   Editorial dark footer, Stairway Roadmap CTA bar
    ├── layouts/
    │   └── Layout.astro   HTML shell, meta tags, GA4, Schema.org, scripts
    ├── pages/
    │   └── index.astro    Homepage (Hero, Services, 8 Journeys, NEXA, Same-Day, Testimonials)
    └── styles/
        └── global.css     Design tokens + Tailwind v4 + custom components
```

---

## 🚀 Deploy to Vercel

### Option 1: Via GitHub (recommended)

```bash
# 1. From this folder
git init
git branch -M main
git add .
git commit -m "Initial: Stairway Mortgage editorial redesign"

# 2. Create empty repo on github.com/stairwaymortgage
# Name suggestion: stairwaymortgage-site

# 3. Push (using URL GitHub gives you)
git remote add origin https://github.com/stairwaymortgage/stairwaymortgage-site.git
git push -u origin main
```

Then in browser:
4. Go to **vercel.com/new** → select the GitHub repo
5. Team: **stairway mortgage's projects**
6. Framework: **Astro** (auto-detected)
7. Click **Deploy** → 1-2 minutes → live URL

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🛠 Local development

```bash
npm install
npm run dev     # Open http://localhost:4321
npm run build   # Output → dist/
npm run preview # Preview production build locally
```

---

## ✅ What's done (Phase 1)

- [x] Design system + tokens
- [x] Header (4-dropdown mega-menu, mobile menu, sticky)
- [x] Footer (Stairway Roadmap close-bar, dark 5-col, social, NMLS info)
- [x] Layout (meta tags, GA4, Schema.org MortgageBroker, scroll reveal, lead-router)
- [x] Homepage (Hero, Services strip, 8 Journeys, NEXA, Same-Day, Testimonials, Final CTA)
- [x] Responsive (mobile-first, breakpoints at 640/1024)
- [x] Accessibility (semantic HTML, keyboard nav, reduced-motion respect)
- [x] SEO (canonical URLs, OG/Twitter cards, sitemap, Schema.org)

## 📋 Phase 2 backlog (next turns)

- [ ] Founder & Philosophy page
- [ ] Contact us page (+ GHL form embed)
- [ ] 4 journey landing pages (Buy, Sell, Refinance, Reverse)
- [ ] 8 journey detail pages (Smart Stewards through Legacy Angel)
- [ ] NEXA Partnership page
- [ ] Same-Day Approval page (with GHL form)

## 📋 Phase 3+ backlog

- [ ] Loan Programs index + 44 dynamic pages (`[slug].astro`)
- [ ] Case Studies index + 83 dynamic pages
- [ ] Loan Calculators index + 132 calculator shells (interactive JS rebuild needed)
- [ ] Blog index + 150 posts
- [ ] Profession-specific pages (Medical, Aviation, Corporate Exec, etc.)
- [ ] Quizzes (9 multi-step quiz pages — likely use GHL surveys)
- [ ] Legal pages (Privacy variants, Terms, State Licensing, etc.)

---

## 🔌 Third-party integrations

| Tool | Status | Where |
|---|---|---|
| **GHL** (`forms.stairwaymortgage.com`) | ✅ Preserved — 33 surveys + 1 form + 1 booking | iframes/scripts in inquiry/quiz pages |
| **GA4** `G-JKZV58GRQK` | ✅ In Layout.astro | All pages |
| **Lead Router LO attribution** | ✅ Inline in Layout.astro | Preserved verbatim from WP snippet 46136 |
| **Schema.org MortgageBroker** | ✅ Added | Improves Google rich snippets |
| Optiryte IP tracker | ❌ Removed | (was unnecessary, GA4 covers analytics) |
| reCAPTCHA | ❌ Removed | (GHL handles spam) |

---

## 🖼 Images & video strategy

Currently referenced via absolute URLs to `stairwaymortgage.com/wp-content/uploads/...` (WordPress remains as media CDN).

**Long-term migration path** (do after launch):
1. Create Cloudflare R2 bucket
2. Bulk upload all media from WP to R2
3. Bulk find-replace URLs in HTML
4. Decommission WordPress entirely

R2 cost: ~$1.50/month for 100GB, zero egress fees.

---

## 📞 Brand contacts

- **Phone:** (954) 255-6680
- **NMLS:** #1660690 (NEXA Mortgage LLC, dba Stairway Mortgage)
- **State License:** AZMB-0944059
- **Address:** 5559 S Sossaman Rd, Bldg #1 Ste #101, Mesa, AZ 85212
- **Tagline:** *Leverage wisely. Grow wealthy.*
- **Social:** @mortgagemanjim
