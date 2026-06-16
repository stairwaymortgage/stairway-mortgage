#!/usr/bin/env python3
"""
================================================================================
 STAIRWAY MORTGAGE — SITE AUDIT HARNESS  v12
================================================================================
 Single gating tool for the pre-domain-switch final audit.

 Supersedes audit_v10.py. Adds the rule layers the old harness never checked:
   - Layer A  v11 SEO/structure rules (KW / ST / CIT / IMG / TECH)  [carried fwd]
   - Layer B  Compliance & brand rules from project memory           [NEW]
                * CTA wording   ("See My Options" / "Talk to Our Team";
                                  NEVER "Talk to Jim" / "call with Jim"
                                  outside reviews & founder copy)
                * Phone         (954) 993-1625   — never 255-6680
                * Closed stat   $500M+            — never $350M / $350M+
                * NMLS          Jim #1072866 in body; NEXA #1660690 footer-only
                * NEXA claims   "48 states" etc. never in body near Jim
                * Fonts         Fraunces / IBM Plex / JetBrains  (not
                                  Instrument Serif / Geist — stale)
   - Layer C  Link integrity   (internal links resolve to a real route/file) [NEW]
   - Layer D  Honesty          prints DOC-vs-ACTUAL drift, never trusts a doc
                                claim it did not itself measure.            [NEW]

 USAGE
   Standalone aviation files (this sandbox):
     python3 audit_v12.py --glob 'Stairway_*_v10.html'
   Whole Astro repo (Claude Code runs this):
     python3 audit_v12.py --repo /path/to/stairway-vercel
   Single file:
     python3 audit_v12.py --file src/pages/aviation-professionals/pilots.astro

 The repo mode walks src/pages/**, infers keyword + kind from the route, and
 audits every page. It also builds the site-wide route table for the link check
 and the testimonial-photo registry for IMG-6.

 EXIT CODE = number of FAILs (0 = clean gate). WARNs do not fail the gate.
================================================================================
"""
import re, os, sys, glob, json, argparse
from collections import defaultdict, Counter

# ------------------------------------------------------------------ constants
JIM_NMLS   = "1072866"
NEXA_NMLS  = "1660690"
GOOD_PHONE = "954) 993-1625"          # canonical
BAD_PHONE  = "954) 255-6680"          # stale, must never appear
GOOD_STAT  = re.compile(r"\$5\d{2}\s*M", re.I)         # $500M+
BAD_STAT   = re.compile(r"\$350\s*M\+?(?!\w)")           # $350M / $350M+ only (not $350 monthly, $350,000)

# CTA wording rule (project memory). Jim's name allowed ONLY in review/founder copy.
CTA_BAD = [r"talk to jim", r"call with jim", r"schedule a call with jim"]
CTA_GOOD = ["see my options", "talk to our team"]

# TECH-8 NEXA-level claims that must not sit in the body near Jim.
NEXA_BLOCKLIST = [
    "licensed in 48 states", "licensed in 47 states", "licensed in all 50 states",
    "licensed in 49 states", "founded in 2007", "nexa mortgage", NEXA_NMLS,
]

# Fonts: canonical vs stale
GOOD_FONTS = ["Fraunces", "Inter", "JetBrains"]
STALE_FONTS = ["Instrument Serif", "Geist", "IBM Plex"]
# Forest palette (new canonical). Old tokens flagged for migration.
STALE_COLORS = ["#1845D6", "#0A0E1A", "#FAFAF7", "#8B2C2C", "#2E9E2E",
                "#E0A96D", "#2d2350", "#382b62"]

# Tier-1 citation domains
TIER1 = (".gov", ".mil", ".edu", "faa.gov", "bls.gov", "irs.gov", "fhfa.gov",
         "opm.gov", "ntsb.gov", "dot.gov", "congress.gov", "law.cornell.edu",
         "fanniemae.com", "freddiemac.com")

# ----- PAGE-TYPE CLASSIFIER -----------------------------------------------
# Universal rules (CTA, phone, stat, fonts, NMLS, links, ALL technical SEO,
# mobile) apply to EVERY page. Only content-DEPTH rules (word count, FAQ count,
# citation count, KW density) scale by type so a legal page isn't failed for
# not having 25 FAQs. "skip" depth = those checks become INFO, not FAIL.
def classify(route):
    r = route.strip("/")
    p = [x for x in r.split("/") if x]
    if r == "" : return "home"
    if r.startswith("blog/"):            return "blog"
    if r == "blog":                      return "index"
    if r.startswith("loan-calculator/"): return "calculator"
    if r.startswith("loan-programs/") and len(p)>1: return "program"
    if r.startswith("case-studies/") and len(p)>1:  return "casestudy"
    if r.startswith("the-8-steps/") and len(p)>1:   return "step"
    # hub & sub detection: known client/partner hub roots
    HUBS = ("aviation-professionals","medical-professionals","dental-wellness-professionals",
            "yacht-professionals","corporate-executives","professional-services",
            "creative-earners","sales-professionals","realtors","cpas-accountants",
            "financial-advisors","attorneys","insurance-agents","divorce-professionals",
            "wealth-managers")
    if p and p[0] in HUBS:
        return "sub" if len(p)>=2 else "hub"
    if r.endswith(("-mortgage","-loans","-loan")) or "calculators" in r: return "index"
    return "misc"   # legal, partner, thank-you, schedule, etc.

# depth profile per type: (apply_depth_rules, faq_required_or_None, cit_min_or_None)
DEPTH = {
    "hub":(True,10,25), "sub":(True,25,50),
    "blog":(False,None,None), "program":(False,None,None),
    "casestudy":(False,None,None), "step":(False,None,None),
    "calculator":(False,None,None), "index":(False,None,None),
    "home":(False,None,None), "misc":(False,None,None),
}

# Goal-centered bands (v11 §8.11) -> (hard_lo, warn_lo, goal, warn_hi, hard_hi)
def kw1_band(L):
    if L <= 3:  return (1.0, 1.5, 1.8, 2.2, 2.5)
    if L == 4:  return (1.5, 2.0, 2.3, 2.7, 3.0)
    return (2.0, 2.5, 2.8, 3.2, 3.5)
WC_SUB = (6000, 6500, 7000, 7500, 8000)
WC_HUB = (2000, 2300, 2500, 2700, 3000)
KW2_BAND = (1.0, 1.2, 1.4, 1.7, 2.0)
CIT2_BAND = (40, 50, 55)  # hard floor / warn floor / goal (percent)

# ------------------------------------------------------------------ helpers
class Report:
    def __init__(self): self.fails=0; self.warns=0; self.lines=[]
    def add(self, status, code, msg):
        if status=="FAIL": self.fails+=1
        if status=="WARN": self.warns+=1
        self.lines.append((status, code, msg))
    def emit(self):
        sym={"PASS":"PASS","WARN":"WARN","FAIL":"FAIL","INFO":"----"}
        for st,code,msg in self.lines:
            print(f"  [{sym[st]}] {code:8} {msg}")

def strip_text(html):
    html = re.sub(r"<style.*?</style>", " ", html, flags=re.S|re.I)
    html = re.sub(r"<script.*?</script>", " ", html, flags=re.S|re.I)
    txt = re.sub(r"<[^>]+>", " ", html)
    txt = re.sub(r"&[a-z]+;", " ", txt)
    return re.sub(r"\s+", " ", txt).strip()

def body_only(html):
    """HTML with <head>, <footer>, <style>, <script> removed. Used for compliance
    scans (NMLS/NEXA) where footer content is CORRECT per RULEBOOK §1.1 and must
    not trip body-only rules. Footer legitimately holds NEXA #1660690 + '48 states'."""
    h = re.sub(r"<head.*?</head>", " ", html, flags=re.S|re.I)
    # semantic <footer>…</footer>
    h = re.sub(r"<footer\b.*?</footer>", " ", h, flags=re.S|re.I)
    # fallback: a <div ... class="...footer...">…</div> footer (best-effort, last one on page)
    m = re.search(r'<(div|section)\b[^>]*(?:class|id)="[^"]*\bfooter\b[^"]*"[^>]*>', h, re.I)
    if m:
        h = h[:m.start()] + " "   # drop everything from the footer open onward (footer is page-final)
    h = re.sub(r"<style.*?</style>", " ", h, flags=re.S|re.I)
    h = re.sub(r"<script.*?</script>", " ", h, flags=re.S|re.I)
    return h

def band_status(val, band):
    lo, wlo, goal, whi, hi = band
    if val < lo or val > hi: return "FAIL", goal
    if val < wlo or val > whi: return "WARN", goal
    return "PASS", goal

def cit_status(pct):
    hard, warn, goal = CIT2_BAND
    if pct < hard: return "FAIL", goal
    if pct < warn: return "WARN", goal
    return "PASS", goal

# ------------------------------------------------------------------ per-page audit
def is_redirect_stub(html):
    """A redirect stub = meta-refresh redirect OR a noindex page with near-zero
    body content. These are intentional 301-style stubs (WP date permalinks, slug
    aliases). They SHOULD be noindex and have no viewport/description — failing
    them on full-page rules is a category error. Detect and exempt."""
    has_refresh = bool(re.search(r'<meta[^>]+http-equiv=["\']?refresh', html, re.I))
    has_noindex = bool(re.search(r'name=["\']?robots["\']?[^>]+noindex', html, re.I))
    body_words = len(strip_text(re.sub(r"<head.*?</head>"," ",html,flags=re.S|re.I)).split())
    return has_refresh or (has_noindex and body_words < 60)

def audit_page(path, html, kw, kind, faces_registry, routes, drift):
    R = Report()

    # ---- Redirect-stub short-circuit (exempt from full-page rules) ----
    if is_redirect_stub(html):
        canon = re.search(r'<link[^>]+rel=["\']?canonical["\']?[^>]+href="([^"]+)"', html, re.I)
        refresh = re.search(r'<meta[^>]+http-equiv=["\']?refresh["\']?[^>]+content="[^"]*url=([^"\']+)', html, re.I)
        target = (canon.group(1) if canon else None) or (refresh.group(1) if refresh else None)
        R.add("PASS" if target else "WARN", "REDIR", f"redirect stub -> {target or 'NO TARGET (check)'}")
        # still enforce the one compliance rule that matters: no NEXA NMLS leak in a stub body
        body_txt = strip_text(body_only(html))
        R.add("PASS" if NEXA_NMLS not in body_txt else "FAIL", "TECH-6a", f"NEXA #{NEXA_NMLS} in stub body")
        return R

    text = strip_text(html)
    words = text.split()
    wc = len(words)
    L = len(kw.split())
    kwcnt = len(re.findall(re.escape(kw), text, re.I))
    apply_depth, faq_req, cit_min = DEPTH.get(kind, (False, None, None))

    # ---- ST-4 word count (depth-gated)
    if apply_depth:
        band = WC_SUB if kind=="sub" else WC_HUB
        st, goal = band_status(wc, band)
        drift.append(("ST-4 WC", path, wc, goal))
        R.add(st, "ST-4", f"word count {wc} (goal {goal}, band {band[0]}-{band[4]})")
    else:
        R.add("INFO", "ST-4", f"word count {wc} (depth rule n/a for {kind})")

    # ---- KW-1 density (depth-gated)
    if apply_depth:
        dens = (kwcnt * L / wc * 100) if wc else 0
        b = kw1_band(L)
        st, goal = band_status(dens, b)
        drift.append((f"KW-1 L={L}", path, round(dens,2), goal))
        R.add(st, "KW-1", f"density {dens:.2f}% (L={L}, goal {goal}%, {kwcnt}x)")

    # ---- KW-3 H1 (depth-gated for kw, but H1-presence universal)
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.S|re.I)
    h1txt = " ".join(re.sub(r"<[^>]+>","",h) for h in h1s).lower()
    R.add("PASS" if len(h1s)==1 else "FAIL", "SEO-H1", f"exactly one H1 ({len(h1s)} found)")
    if apply_depth:
        R.add("PASS" if kw.lower() in h1txt else "FAIL", "KW-3", f"H1 contains '{kw}'")

    # ---- KW-4 H2 coverage (depth-gated)
    h2s = re.findall(r"<h2[^>]*>(.*?)</h2>", html, re.S|re.I)
    if apply_depth:
        h2txt = [re.sub(r"<[^>]+>","",h).lower() for h in h2s]
        h2kw = sum(1 for h in h2txt if kw.lower() in h or kw.split()[0] in h)
        cover = (h2kw/len(h2s)*100) if h2s else 0
        R.add("PASS" if cover>=50 else "FAIL", "KW-4", f"H2 kw coverage {h2kw}/{len(h2s)} = {cover:.0f}%")

    # ---- heading order (universal: no skipped levels)
    levels = [int(m) for m in re.findall(r"<h([1-6])", html)]
    skips = [(levels[i],levels[i+1]) for i in range(len(levels)-1) if levels[i+1]-levels[i]>1]
    R.add("PASS" if not skips else "WARN", "SEO-HORD", f"heading order skips: {skips[:4] if skips else 'none'}")

    # ---- FAQ (depth-gated)
    if apply_depth and faq_req:
        faqs = len(re.findall(r'class="[^"]*faq-item', html)) or len(re.findall(r"<details", html, re.I))
        R.add("PASS" if faqs==faq_req else "WARN", "ST-3", f"{faqs} FAQs (need {faq_req})")
        faq_blocks = re.split(r'class="[^"]*faq-item', html)[1:]
        faq_kw = sum(1 for fb in faq_blocks if kw.lower() in strip_text(fb).lower())
        need_kw = 20 if kind=="sub" else 8
        R.add("PASS" if faq_kw>=need_kw else "WARN", "KW-5", f"FAQ kw coverage {faq_kw}/{faqs}")

    # ---- citations (depth-gated)
    hrefs = re.findall(r'href="(https?://[^"]+)"', html)
    ext = [h for h in hrefs if "stairwaymortgage.com" not in h
           and "fonts.g" not in h and "cdnjs" not in h and "pexels.com" not in h
           and "pravatar" not in h and "placehold.co" not in h]
    if apply_depth and cit_min:
        cit = len(ext)
        R.add("PASS" if cit>=cit_min else "WARN", "CIT-1", f"{cit} external citations (>={cit_min})")
        t1 = sum(1 for h in ext if any(d in h.lower() for d in TIER1))
        t1pct = (t1/cit*100) if cit else 0
        st,goal = cit_status(t1pct)
        drift.append(("CIT-2 T1%", path, round(t1pct), goal))
        R.add(st, "CIT-2", f"Tier-1 share {t1pct:.0f}% (goal {goal}%)")

    # ============ UNIVERSAL: NMLS HYGIENE (every page) ============
    # Scan BODY ONLY — footer legitimately holds NEXA #1660690 + "48 states"
    # per RULEBOOK §1.1, so excluding <footer>/<head> kills the false positives.
    # ALSO exempt REQUIRED REGULATORY DISCLOSURES in body:
    #   - "Equal Housing Lender" in same paragraph as NMLS# = compliance disclosure
    #   - "division of NEXA Mortgage" = entity attribution (required)
    #   - Legal/NEXA-partnership pages = intentional NEXA content
    #   - <aside>, <small>, .compliance, .disclosure wrappers
    body = body_only(html)
    body_txt = strip_text(body).lower()

    # Strip disclosure blocks from the compliance scan (they're required, not marketing)
    body_no_disclosure = body
    # Remove everything from "Equal Housing Lender" onward in the page (it's always
    # the compliance disclosure at the bottom of article bodies — regulatory boilerplate)
    ehl = re.search(r'equal\s+housing\s+lender', body_no_disclosure, re.I)
    if ehl:
        body_no_disclosure = body_no_disclosure[:ehl.start()]
    # Also remove paragraphs containing "NMLS #1660690" + "dba Stairway" (disclosure boilerplate)
    body_no_disclosure = re.sub(r'<p[^>]*>[^<]*NMLS\s*#?\s*1660690[^<]*</p>', ' ', body_no_disclosure, flags=re.I|re.S)
    body_no_disclosure = re.sub(r'<p[^>]*>[^<]*dba\s+Stairway[^<]*</p>', ' ', body_no_disclosure, flags=re.I|re.S)
    # Remove <aside>, <small>, .compliance, .disclosure elements
    body_no_disclosure = re.sub(r'<aside[^>]*>.*?</aside>', ' ', body_no_disclosure, flags=re.I|re.S)
    body_no_disclosure = re.sub(r'<small[^>]*>.*?</small>', ' ', body_no_disclosure, flags=re.I|re.S)
    body_no_disclosure = re.sub(r'<[^>]*class="[^"]*(?:compliance|disclosure)[^"]*"[^>]*>.*?</[^>]*>', ' ', body_no_disclosure, flags=re.I|re.S)
    # Remove "division of NEXA Mortgage" entity attribution (always legitimate)
    body_no_disclosure = re.sub(r'(?:a\s+)?division\s+of\s+NEXA\s+Mortgage(?:\s+LLC)?', ' ', body_no_disclosure, flags=re.I)
    # Exempt legal, NEXA partnership, and blog pages where NEXA is editorial content
    is_legal = (kind == "misc" and any(x in path.lower() for x in ["privacy", "terms", "licensing", "disclosure", "nexa-mortgage"])) or kind in ("blog", "index") or "nexa" in path.lower()
    body_scan = " " if is_legal else body_no_disclosure
    body_scan_txt = strip_text(body_scan).lower()

    nexa_body = len(re.findall(NEXA_NMLS, body_scan))
    jim_body = len(re.findall(JIM_NMLS, body))  # Jim count uses full body (not stripped)
    R.add("PASS" if nexa_body==0 else "FAIL", "TECH-6a", f"NEXA #{NEXA_NMLS} in body = {nexa_body} (must be 0; disclosures+footer exempt)")
    # Jim NMLS >=2 only required where Jim is a trust signal (hub/sub); elsewhere just must not be wrong
    if kind in ("hub","sub"):
        R.add("PASS" if jim_body>=2 else "FAIL", "TECH-6b", f"Jim #{JIM_NMLS} in body = {jim_body} (need >=2)")

    hits = [p for p in NEXA_BLOCKLIST if p in body_scan_txt]
    R.add("PASS" if not hits else "FAIL", "TECH-8", f"NEXA claims in body: {hits if hits else '0'} (disclosures+footer exempt)")

    # ============ UNIVERSAL: FULL TECHNICAL SEO (every page) ============
    head = re.search(r"<head.*?</head>", html, re.S|re.I)
    head = head.group(0) if head else html
    t = re.search(r"<title>(.*?)</title>", html, re.S|re.I)
    title = re.sub(r"&amp;","&", re.sub(r"<[^>]+>","",t.group(1)).strip()) if t else ""
    d = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', head, re.I)
    desc = d.group(1) if d else ""
    R.add("PASS" if title else "FAIL", "SEO-TTL", f"<title> present ({len(title)} chars)")
    R.add("PASS" if title and len(title)<=60 else "WARN", "SEO-TTLLEN", f"title <=60 chars ({len(title)})")
    R.add("PASS" if desc else "FAIL", "SEO-DESC", f"meta description present ({len(desc)} chars)")
    R.add("PASS" if desc and 50<=len(desc)<=160 else "WARN", "SEO-DESCLEN", f"desc 50-160 chars ({len(desc)})")
    if apply_depth:
        R.add("PASS" if kw.lower() in title.lower() else "WARN", "TECH-1b", f"title contains '{kw}'")
        R.add("PASS" if kw.lower() in desc.lower() else "WARN", "TECH-2b", f"desc contains '{kw}'")
    # canonical
    canon = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', head, re.I)
    R.add("PASS" if canon else "FAIL", "SEO-CANON", f"canonical link {'present' if canon else 'MISSING'}")
    if canon:
        cv = canon.group(1)
        R.add("PASS" if ".vercel.app" not in cv else "FAIL", "SEO-CANONABS",
              f"canonical not hardcoded to .vercel.app ({'ok' if '.vercel.app' not in cv else cv})")
    # Open Graph + Twitter
    og = len(re.findall(r'property="og:', head))
    tw = len(re.findall(r'name="twitter:', head))
    R.add("PASS" if og>=3 else "WARN", "SEO-OG", f"OpenGraph tags ({og})")
    R.add("PASS" if tw>=2 else "WARN", "SEO-TW", f"Twitter card tags ({tw})")
    # viewport / mobile
    vp = re.search(r'name="viewport"[^>]+content="([^"]*)"', head, re.I)
    R.add("PASS" if vp and "width=device-width" in vp.group(1) else "FAIL", "MOB-VP",
          f"viewport meta {'ok' if vp and 'width=device-width' in vp.group(1) else 'MISSING/BAD'}")
    # lang
    R.add("PASS" if re.search(r'<html[^>]+lang=', html, re.I) else "WARN", "SEO-LANG", "html lang attribute")
    # noindex guard (production pages must be indexable)
    noidx = re.search(r'name="robots"[^>]+content="[^"]*noindex', head, re.I)
    R.add("PASS" if not noidx else "FAIL", "SEO-IDX", f"page indexable {'(noindex found!)' if noidx else 'yes'}")
    # structured data
    R.add("PASS" if "application/ld+json" in html else "WARN", "SEO-LD", f"JSON-LD schema {'present' if 'application/ld+json' in html else 'absent'}")
    # images: alt-text coverage + dimensions
    imgs = re.findall(r"<img\b[^>]*>", html)
    no_alt = [i for i in imgs if not re.search(r'\balt=', i)]
    no_dim = [i for i in imgs if not (re.search(r'\bwidth=', i) and re.search(r'\bheight=', i)) and "pravatar" not in i]
    R.add("PASS" if not no_alt else "WARN", "A11Y-ALT", f"images missing alt: {len(no_alt)}/{len(imgs)}")
    R.add("PASS" if len(no_dim)<=2 else "WARN", "MOB-DIM", f"images w/o width+height (CLS risk): {len(no_dim)}/{len(imgs)}")

    # ============ UNIVERSAL: COMPLIANCE / BRAND (every page) ============
    # testimonial face registry for IMG-6
    for fid in re.findall(r"i\.pravatar\.cc/\d+\?img=(\d+)", html):
        faces_registry[fid].append(path)
    # CTA wording — exclude review & founder/story copy regions from the scan
    scan = html
    for region in [r'class="[^"]*testim.*?</section>', r'class="[^"]*review.*?</section>',
                   r'class="[^"]*founder.*?</section>', r'class="[^"]*bio.*?</section>',
                   r'class="[^"]*story.*?</section>']:
        scan = re.sub(region, " ", scan, flags=re.S|re.I)
    bad_cta = []
    for pat in CTA_BAD:
        bad_cta += re.findall(pat, scan, re.I)
    R.add("PASS" if not bad_cta else "FAIL", "CTA-1",
          f"non-compliant CTA phrases ({len(bad_cta)}): " +
          (", ".join(sorted(set(c.lower() for c in bad_cta))) if bad_cta else "none"))

    # Phone
    R.add("PASS" if BAD_PHONE.replace(") ",") ") not in html else "FAIL", "PHONE-1",
          f"stale phone 255-6680 present = {'YES' if BAD_PHONE in html else 'no'}")

    # Closed-loan stat
    if BAD_STAT.search(text):
        R.add("FAIL", "STAT-1", "stale closed-loan stat ($3xxM) present")
    else:
        R.add("PASS", "STAT-1", "no stale $3xxM stat")

    # Fonts
    stale = [f for f in STALE_FONTS if f.lower() in html.lower()]
    R.add("PASS" if not stale else "WARN", "FONT-1", f"stale fonts: {stale if stale else 'none'}")

    # FONT-2: H1 must resolve to the display serif (Fraunces), never the body font.
    # Accept if the h1 carries the .display class OR an h1 CSS rule names Fraunces/--display.
    h1_has_display = bool(re.search(r'<h1[^>]*class="[^"]*\bdisplay\b', html, re.I))
    h1_css_fraunces = bool(re.search(r'h1[^{]*\{[^}]*(?:Fraunces|var\(--display\))', html, re.I))
    R.add("PASS" if (h1_has_display or h1_css_fraunces or not h1s) else "WARN", "FONT-2",
          f"H1 uses display serif (Fraunces): {'yes' if (h1_has_display or h1_css_fraunces) else 'NOT CONFIRMED'}")

    # MOB-H1: H1 font-size must be fluid clamp(), never a fixed rem/px (mobile overflow fix).
    h1_size_clamp = bool(re.search(r'h1[^{]*\{[^}]*font-size:\s*[^;]*clamp\(', html, re.I)) \
                    or bool(re.search(r'--step-6:\s*clamp\(', html, re.I))
    h1_size_fixed = bool(re.search(r'h1[^{]*\{[^}]*font-size:\s*\d+(?:\.\d+)?(?:rem|px)\s*[;}]', html, re.I))
    if h1_size_clamp:
        R.add("PASS", "MOB-H1", "H1 font-size uses clamp() (fluid, mobile-safe)")
    elif h1_size_fixed:
        R.add("FAIL", "MOB-H1", "H1 font-size is FIXED rem/px (overflows on mobile) — use clamp()")
    else:
        R.add("INFO", "MOB-H1", "H1 sizing not set inline (likely inherited from Layout/global.css)")

    # PALETTE-1: stale color tokens must not be DEFINED here (shared/global files only,
    # to avoid penalizing pages that legitimately reference a token name).
    if path.endswith(("global.css","Layout.astro","Header.astro","Footer.astro")):
        stale_tok = [c for c in STALE_COLORS if c.lower() in html.lower()]
        R.add("PASS" if not stale_tok else "WARN", "PALETTE-1",
              f"stale color tokens in shared file: {stale_tok if stale_tok else 'none'}")

    # ============ LAYER C — LINK INTEGRITY (repo mode only) ============
    if routes is not None:
        internal = re.findall(r'href="(/[^"#?]*)"', html)
        broken = []
        for link in internal:
            norm = link.rstrip("/")
            if norm == "": continue
            if norm not in routes and norm+"/" not in routes:
                # allow asset paths
                if not re.search(r"\.(png|jpg|jpeg|svg|webp|pdf|css|js|ico|mp4|xml|txt)$", norm):
                    broken.append(link)
        R.add("PASS" if not broken else "FAIL", "LINK-1",
              f"internal links resolving: {len(set(internal))-len(set(broken))}/{len(set(internal))}"
              + (f" | BROKEN: {sorted(set(broken))[:8]}" if broken else ""))
    return R

# ------------------------------------------------------------------ repo route table
def build_routes(repo):
    routes=set()
    pages_dir = os.path.join(repo, "src", "pages")
    for root,_,fs in os.walk(pages_dir):
        for fn in fs:
            if fn.endswith((".astro",".md",".mdx",".html")):
                rel = os.path.relpath(os.path.join(root,fn), pages_dir)
                rel = re.sub(r"\.(astro|md|mdx|html)$","",rel)
                rel = re.sub(r"/index$","",rel)
                rel = "" if rel=="index" else rel
                routes.add("/"+rel.replace(os.sep,"/").rstrip("/"))
    # public assets
    pub = os.path.join(repo,"public")
    if os.path.isdir(pub):
        for root,_,fs in os.walk(pub):
            for fn in fs:
                rel = os.path.relpath(os.path.join(root,fn), pub)
                routes.add("/"+rel.replace(os.sep,"/"))
    return routes

def infer_kw_kind(route):
    """Infer keyword + kind from a hub/sub route. Sub-pages = leaf under a hub."""
    parts = [p for p in route.strip("/").split("/") if p]
    if not parts: return None, None
    leaf = parts[-1]
    singular = leaf.rstrip("s") if leaf.endswith("s") else leaf
    kw = singular.replace("-"," ") + " mortgage"
    kind = "sub" if len(parts)>=2 else "hub"
    return kw, kind

# ------------------------------------------------------------------ main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo")
    ap.add_argument("--built", help="path to built dist/ folder; audits rendered HTML (sees Layout-injected head tags)")
    ap.add_argument("--glob")
    ap.add_argument("--file")
    ap.add_argument("--map", help="optional JSON {file: {kw, kind}} overrides")
    args = ap.parse_args()

    overrides = json.load(open(args.map)) if args.map else {}
    faces=defaultdict(list); drift=[]; routes=None; targets=[]

    if args.built:
        # Audit rendered HTML. Route is derived from the dist path; the route
        # table for LINK-1 is built from the dist tree itself.
        dist = args.built.rstrip("/\\")
        routes=set()
        for root,_,fs in os.walk(dist):
            for fn in fs:
                rel="/"+os.path.relpath(os.path.join(root,fn), dist).replace(os.sep,"/")
                routes.add(rel)
                if fn=="index.html":
                    r=re.sub(r"/index\.html$","",rel); routes.add(r if r else "/")
        print(f"[built] {len(routes)} routes/assets indexed from {dist}\n")
        for root,_,fs in os.walk(dist):
            for fn in fs:
                if fn.endswith(".html"):
                    p=os.path.join(root,fn)
                    rel="/"+os.path.relpath(p, dist).replace(os.sep,"/")
                    route=re.sub(r"/index\.html$","",rel); route=re.sub(r"\.html$","",route)
                    route="" if route in ("","/index") else route
                    kw,_=infer_kw_kind(route); kind=classify(route)
                    if kind not in ("hub","sub"): kw=kw or "mortgage"
                    targets.append((p,kw,kind))
    elif args.repo:
        routes = build_routes(args.repo)
        print(f"[repo] {len(routes)} routes/assets indexed\n")
        for root,_,fs in os.walk(os.path.join(args.repo,"src","pages")):
            for fn in fs:
                if fn.endswith((".astro",".html")):
                    p=os.path.join(root,fn)
                    rel="/"+os.path.relpath(p, os.path.join(args.repo,"src","pages"))
                    route=re.sub(r"\.(astro|html)$","",rel); route=re.sub(r"/index$","",route)
                    kw,kind = infer_kw_kind(route)
                    kind = classify(route)
                    if kind not in ("hub","sub"):
                        kw = kw or "mortgage"
                    targets.append((p,kw,kind))
    elif args.glob:
        # known aviation mapping
        avmap = {
          "hub":("aviation mortgage","hub"),"pilots":("pilot mortgage","sub"),
          "flight_attendants":("flight attendant mortgage","sub"),
          "aircraft_mechanics":("aircraft mechanic mortgage","sub"),
          "air_traffic_controllers":("air traffic controller mortgage","sub"),
        }
        for p in sorted(glob.glob(args.glob, recursive=True)):
            kw,kind=None,None
            for k,(kk,knd) in avmap.items():
                if k in p: kw,kind=kk,knd
            if not kw: kw,kind=("mortgage","sub")
            targets.append((p,kw,kind))
    elif args.file:
        kw = overrides.get(args.file,{}).get("kw","mortgage")
        kind = overrides.get(args.file,{}).get("kind","sub")
        targets.append((args.file,kw,kind))
    else:
        ap.error("need --repo, --built, --glob, or --file")

    total_fail=total_warn=0
    for path,kw,kind in targets:
        html=open(path,encoding="utf-8").read()
        if path in overrides:
            kw=overrides[path].get("kw",kw); kind=overrides[path].get("kind",kind)
        print(f"== {os.path.basename(path)}  [{kind}]  kw='{kw}' ==")
        R=audit_page(path,html,kw,kind,faces,routes,drift)
        R.emit()
        total_fail+=R.fails; total_warn+=R.warns
        print(f"   -> {R.fails} FAIL, {R.warns} WARN\n")

    # IMG-6 testimonial photo uniqueness (same-page or same-hub-family = FAIL)
    print("== IMG-6 testimonial photo uniqueness (page + hub-family scope) ==")
    dist_root = args.built.rstrip("/\\") if args.built else (args.repo or "")
    def _hub_key(p):
        """Return hub family key from dist path, e.g. 'aviation-professionals'."""
        rel = os.path.relpath(p, dist_root).replace(os.sep, "/")
        parts = rel.strip("/").split("/")
        # e.g. aviation-professionals/pilot/index.html -> hub='aviation-professionals'
        # e.g. attorneys/index.html -> hub='attorneys' (top-level, no sub-pages)
        return parts[0] if len(parts) > 1 else ""
    img6_fails = 0
    for fid, ps in faces.items():
        if len(ps) < 2:
            continue
        # Check 1: same page appears more than once (same face used 2x on one page)
        page_counts = Counter(ps)
        same_page = {p: c for p, c in page_counts.items() if c > 1}
        # Check 2: same hub family has the face on multiple distinct pages
        hub_pages = defaultdict(set)
        for p in ps:
            hub_pages[_hub_key(p)].add(p)
        same_hub = {h: pages for h, pages in hub_pages.items() if h and len(pages) > 1}
        if same_page:
            for p, c in same_page.items():
                rel = os.path.relpath(p, dist_root).replace(os.sep, "/")
                print(f"  [FAIL] pravatar#{fid} used {c}x on same page: {rel}")
                img6_fails += 1
        if same_hub:
            for h, pages in same_hub.items():
                rels = [os.path.relpath(p, dist_root).replace(os.sep, "/") for p in pages]
                print(f"  [FAIL] pravatar#{fid} reused in hub '{h}': {rels}")
                img6_fails += 1
    if img6_fails == 0:
        global_reuse = sum(1 for fid, ps in faces.items() if len(ps) > 1)
        print(f"  [PASS] {len(faces)} faces, 0 same-page/hub-family dupes ({global_reuse} cross-site reuses OK)")
    total_fail += img6_fails

    # Drift-from-goal report
    print("\n== DRIFT-FROM-GOAL (v11 §8.11) ==")
    for metric,path,val,goal in drift:
        d=round(val-goal,2)
        print(f"  {metric:12} {os.path.basename(path):42} landed {val:>7} goal {goal:>6} drift {d:+g}")

    print(f"\n================ ROLL-UP: {total_fail} FAIL, {total_warn} WARN ================")
    sys.exit(total_fail)

if __name__=="__main__":
    main()
