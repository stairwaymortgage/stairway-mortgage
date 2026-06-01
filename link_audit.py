#!/usr/bin/env python3
"""Link-integrity audit. Run from repo root AFTER a build (needs dist/).
Crawls every internal href in built HTML, checks each resolves to a real built
page or a configured redirect. Reports 404s and redirect-chains. This is the
step that was missing in the prior failed migration."""
import os, re, sys, glob, json

REPO=sys.argv[1] if len(sys.argv)>1 else '.'
DIST=os.path.join(REPO,'dist')

# 1) collect every built URL (dist/**/index.html -> /path/)
built=set()
for f in glob.glob(os.path.join(DIST,'**','index.html'), recursive=True):
    rel=os.path.relpath(f, DIST).replace('\\','/')
    url='/'+rel[:-len('index.html')]
    url=url.replace('//','/')
    built.add(url if url.endswith('/') else url+'/')
built.add('/')

# 2) collect redirects from astro.config.mjs (string form) + vercel.json if present
redirects={}
cfg=os.path.join(REPO,'astro.config.mjs')
if os.path.exists(cfg):
    c=open(cfg).read()
    for m in re.finditer(r"'(/[^']+)'\s*:\s*'(/[^']+)'", c):
        redirects[m.group(1).rstrip('/')+'/']=m.group(2)
vj=os.path.join(REPO,'vercel.json')
if os.path.exists(vj):
    try:
        for r in json.load(open(vj)).get('redirects',[]):
            redirects[r['source'].rstrip('/')+'/']=r['destination']
    except: pass

# 3) scan every built HTML for internal links
B='https://stairwaymortgage.com'
broken={}; chains={}; ok=0; ext=0
for f in glob.glob(os.path.join(DIST,'**','index.html'), recursive=True):
    page='/'+os.path.relpath(f,DIST).replace('\\','/')[:-len('index.html')]
    html=open(f,encoding='utf-8',errors='ignore').read()
    for href in re.findall(r'href="([^"]+)"', html):
        h=href.split('#')[0].split('?')[0]
        if h.startswith(B): h=h[len(B):]
        elif h.startswith('http'): ext+=1; continue
        elif not h.startswith('/'): continue
        if not h.endswith('/') and '.' not in h.split('/')[-1]: h=h+'/'
        if h in built: ok+=1
        elif h in redirects:
            chains.setdefault(redirects[h] if redirects[h] in built else 'DEAD-REDIRECT:'+h, []).append(page)
        else:
            broken.setdefault(h, set()).add(page)

print(f"built pages: {len(built)} | redirects: {len(redirects)}")
print(f"internal links OK: {ok} | external: {ext}")
print(f"\nBROKEN internal links (404): {len(broken)} unique targets")
for tgt,pages in sorted(broken.items())[:60]:
    print(f"  404  {tgt}   (linked from {len(pages)} page(s))")
if len(broken)>60: print(f"  ... +{len(broken)-60} more")
print(f"\nLinks hitting a redirect (chain, not fatal): {len(chains)}")
for tgt,pages in list(chains.items())[:15]:
    print(f"  -> {tgt}  ({len(pages)})")
