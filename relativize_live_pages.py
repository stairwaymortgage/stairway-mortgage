#!/usr/bin/env python3
"""One-time sweep: convert absolute old-host image URLs -> relative paths in
already-deployed .astro pages, so images load first-party from Vercel and the
old WP host can be decommissioned. Run from repo root with Claude Code.

Only touches IMAGE urls (src/srcset/ogImage to uploads). Leaves <a href> link
URLs to stairwaymortgage.com ALONE (those are handled separately / are canonical).
"""
import re, sys, os, glob

REPO = sys.argv[1] if len(sys.argv) > 1 else '.'
pages = glob.glob(os.path.join(REPO, 'src/pages/**/*.astro'), recursive=True)

total_changed = 0
for p in pages:
    s = open(p, encoding='utf-8').read()
    orig = s
    # 1) <img src="https://stairwaymortgage.com/wp-content/uploads/..."> -> relative
    s = re.sub(r'(src=")https?://stairwaymortgage\.com(/wp-content/uploads/)', r'\1\2', s)
    # 2) srcset + any other absolute uploads URL
    s = re.sub(r'https?://stairwaymortgage\.com(/wp-content/uploads/)', r'\1', s)
    # 3) ogImage="https://...uploads/..." in frontmatter -> KEEP ABSOLUTE
    #    (Open Graph requires absolute URLs for social/crawlers; restore those)
    #    Re-absolutize ONLY ogImage and canonical-adjacent meta image fields:
    s = re.sub(r'(ogImage=")(/wp-content/uploads/)', r'\1https://stairwaymortgage.com\2', s)
    s = re.sub(r'("image":")(/wp-content/uploads/)', r'\1https://stairwaymortgage.com\2', s)
    if s != orig:
        open(p, 'w', encoding='utf-8').write(s)
        n = orig.count('stairwaymortgage.com/wp-content/uploads') - s.count('stairwaymortgage.com/wp-content/uploads')
        total_changed += 1
        print(f"  fixed {os.path.relpath(p, REPO)}  ({n} image URLs relativized)")

print(f"\n{total_changed} page(s) updated. Body images now relative; ogImage/schema image kept absolute (required for Open Graph).")
print("Next: npm run build, then git push to master (authored by Jim).")
