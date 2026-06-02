#!/usr/bin/env python3
"""Re-resolve internal links across all already-built .astro pages, applying the
upgraded resolver (plural->singular loan-programs/case-studies, blog variants, CTA aliases).
Only rewrites href values; touches nothing else. Run from repo root with Claude Code."""
import re, sys, os, glob

REPO=sys.argv[1] if len(sys.argv)>1 else '.'
B='https://stairwaymortgage.com'

# Real URL inventory: scan built pages in dist/ (must build first) OR derive from src filenames.
# Derive from src/pages so we don't need dist.
real=set(['/'])
for f in glob.glob(os.path.join(REPO,'src/pages/**/*.astro'), recursive=True):
    rel=os.path.relpath(f, os.path.join(REPO,'src/pages')).replace('\\','/')
    if rel.endswith('/index.astro'): url='/'+rel[:-len('index.astro')]
    else: url='/'+rel[:-len('.astro')]+'/'
    real.add(url.replace('//','/'))

BLOG_FIX={'/blog/gift-money-for-down-payment/':'/blog/gift-money/','/blog/house-hacking-for-beginners/':'/blog/house-hacking/','/blog/mortgage-pre-approval/':'/blog/mortgage-preapproval/','/blog/real-estate-investing/':'/blog/real-estate-investing-for-beginners/'}
CTA={'/schedule-a-call/':'/schedule-call/','/pre-approval/':'/same-day-approval/','/get-pre-approved/':'/same-day-approval/','/get-approved/':'/same-day-approval/'}

def fix(href):
    if not href.startswith(B): return href
    base=href[len(B):].split('#')[0].split('?')[0]
    if not base.startswith('/'): return href
    if base in real: return href
    # plural -> singular
    m=re.match(r'/(loan-programs|case-studies)/([^/]+?)s/?$', base)
    if m:
        cand='/%s/%s/'%(m.group(1),m.group(2))
        if cand in real: return B+cand
    if base in BLOG_FIX and BLOG_FIX[base] in real: return B+BLOG_FIX[base]
    if base in CTA and CTA[base] in real: return B+CTA[base]
    # missing trailing slash
    if not base.endswith('/') and base+'/' in real: return B+base+'/'
    return href

changed_files=0; total_fixes=0
for f in glob.glob(os.path.join(REPO,'src/pages/**/*.astro'), recursive=True):
    s=open(f,encoding='utf-8').read(); orig=s
    def repl(mm):
        global total_fixes
        new=fix(mm.group(1))
        if new!=mm.group(1): total_fixes+=1
        return 'href="%s"'%new
    s=re.sub(r'href="([^"]+)"', repl, s)
    if s!=orig:
        open(f,'w',encoding='utf-8').write(s); changed_files+=1
print(f"re-resolved links in {changed_files} files, {total_fixes} hrefs fixed")
