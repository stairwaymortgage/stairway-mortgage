#!/usr/bin/env python3
"""Add featured-image heroes to existing case-study and loan-program pages.
Inserts a <figure> hero right after </header>, using each page's WordPress featured
image (rehosted, relative path). Idempotent: skips files that already have a hero.
Run from repo root with Claude Code."""
import json, os, re, sys, glob, html

REPO=sys.argv[1] if len(sys.argv)>1 else '.'
HMAP=json.load(open(os.path.join(os.path.dirname(__file__),'hero_image_map.json')))

HERO_CSS_CS='\n  .cs-hero { margin: 2rem 0 0; }\n  .cs-hero img { width:100%; height:auto; max-height:440px; object-fit:cover; border-radius:14px; border:1px solid var(--color-bone); }'
HERO_CSS_LP='\n  .lp-hero { margin: 2rem 0 0; }\n  .lp-hero img { width:100%; height:auto; max-height:440px; object-fit:cover; border-radius:14px; border:1px solid var(--color-bone); }'

def hero_html(cls, img, alt):
    alt=html.escape(alt or '').replace('"','&quot;')
    return f'  <figure class="container-prose {cls}"><img src="{img}" alt="{alt}" width="1200" height="630" loading="eager" /></figure>\n'

def patch(kind, folder, cls, css):
    m=HMAP[kind]; patched=0; skipped=0; missing=0
    for fp in glob.glob(os.path.join(REPO,'src/pages',folder,'*.astro')):
        slug=os.path.basename(fp)[:-6]
        if slug=='index': continue
        s=open(fp,encoding='utf-8').read()
        if f'{cls}"' in s and '<figure' in s and cls in s.split('</header>')[0]+s[:s.find('</header>')+200] if '</header>' in s else False:
            pass
        if f'class="container-prose {cls}"' in s:  # already has hero
            skipped+=1; continue
        rec=m.get(slug)
        if not rec:  # net-new page, no source image
            missing+=1; continue
        if '</header>' not in s:
            missing+=1; continue
        # insert hero after first </header>
        s=s.replace('</header>\n', '</header>\n\n'+hero_html(cls, rec['img'], rec['alt']), 1)
        # add CSS before the closing </style> (first one)
        if cls not in s.split('<style>')[-1]:
            s=s.replace('</style>', css+'\n</style>', 1)
        open(fp,'w',encoding='utf-8').write(s); patched+=1
    return patched, skipped, missing

cp,cs,cm=patch('case_studies','case-studies','cs-hero',HERO_CSS_CS)
lp,ls,lm=patch('loan_programs','loan-programs','lp-hero',HERO_CSS_LP)
print(f"case-studies: {cp} patched, {cs} already had hero, {cm} no source image (net-new/skip)")
print(f"loan-programs: {lp} patched, {ls} already had hero, {lm} no source image (net-new/skip)")
print("Done. Run npm run build to verify.")
