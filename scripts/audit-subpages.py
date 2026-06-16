import os, re, sys
from pathlib import Path

HUBS = [
    'aviation-professionals',
    'medical-professionals',
    'dental-wellness-professionals',
    'corporate-executives',
    'creative-earners',
    'sales-professionals',
    'yacht-professionals',
    'real-estate-professionals',
    'professional-advisors',
    'business-advisors',
]

V12 = {
    'wc_min': 6000, 'wc_max': 7500,
    'wc_warn_min': 5500, 'wc_warn_max': 8000,
    'h2': 16, 'faq': 25, 'role': 5, 'loan': 8,
    'dark': 6, 'timeline': 5, 'testim': 3, 'keyfact': 4, 'source': 5,
}

def audit(filepath):
    content = open(filepath, encoding='utf-8').read()
    # Extract body between backticks (Astro template literal pattern)
    m = re.search(r'const \w+Body = `(.+?)`;', content, re.DOTALL)
    body = m.group(1) if m else content
    text = re.sub(r'<[^>]+>', ' ', body)
    text = re.sub(r'\s+', ' ', text).strip()
    wc = len(text.split())
    metrics = {
        'wc': wc,
        'h2': len(re.findall(r'<h2[^>]*>', body)),
        'faq': len(re.findall(r'class="faq-item"', body)),
        'role': len(re.findall(r'class="profession-card"', body)),
        'loan': len(re.findall(r'class="loan-program-card"', body)),
        'dark': len(re.findall(r'class="dark-card"', body)),
        'timeline': len(re.findall(r'class="timeline-entry"', body)),
        'testim': len(re.findall(r'class="testim-card"', body)),
        'keyfact': len(re.findall(r'class="key-fact-card"', body)),
        'source': len(re.findall(r'class="source-group"', body)),
        'nmls': body.count('1072866'),
        'nexa_body': body.count('NEXA'),
        'states48_body': body.count('48 states'),
        'links_ext': len([l for l in re.findall(r'href="(https?://[^"]+)"', body) if 'stairwaymortgage.com' not in l]),
        'imgs': len(re.findall(r'<img[^>]+>', body)),
        'imgs_lazy': len(re.findall(r'<img[^>]*loading="lazy"', body)),
        'imgs_onerror': len(re.findall(r'<img[^>]*onerror=', body)),
    }
    flags = []
    if wc < V12['wc_warn_min']: flags.append(f'WC_LOW({wc})')
    elif wc > V12['wc_warn_max']: flags.append(f'WC_HIGH({wc})')
    elif not (V12['wc_min'] <= wc <= V12['wc_max']): flags.append(f'WC_WARN({wc})')
    for key in ['h2','faq','role','loan','dark','timeline','testim','keyfact','source']:
        if metrics[key] != V12[key]:
            flags.append(f'{key.upper()}({metrics[key]}/{V12[key]})')
    if metrics['nmls'] < 1: flags.append('NO_NMLS')
    if metrics['nexa_body'] > 0: flags.append(f'NEXA_BODY({metrics["nexa_body"]})')
    if metrics['states48_body'] > 0: flags.append(f'48STATES({metrics["states48_body"]})')
    if metrics['imgs'] > 0 and metrics['imgs_lazy'] < metrics['imgs']: flags.append(f'IMG_LAZY({metrics["imgs_lazy"]}/{metrics["imgs"]})')
    if metrics['imgs'] > 0 and metrics['imgs_onerror'] < metrics['imgs']: flags.append(f'IMG_ONERR({metrics["imgs_onerror"]}/{metrics["imgs"]})')
    return metrics, flags

print('=' * 100)
print(f'{"HUB / SUB-PAGE":<60} {"WC":>6} {"FAQ":>4} {"ROLE":>5} {"CITE":>5} {"NMLS":>5} STATUS')
print('=' * 100)

total = 0
clean = 0
flagged = 0
results = {}

for hub in HUBS:
    hub_dir = Path(f'src/pages/{hub}')
    if not hub_dir.exists():
        print(f'[--] /{hub}/  DIR NOT FOUND')
        continue
    pages = sorted([f for f in hub_dir.glob('*.astro') if f.name != 'index.astro'])
    results[hub] = []
    for p in pages:
        total += 1
        try:
            m, f = audit(p)
            results[hub].append((p.name, m, f))
            status = 'CLEAN' if not f else f'FLAGS: {", ".join(f)}'
            if not f: clean += 1
            else: flagged += 1
            print(f'  /{hub}/{p.stem:<48} {m["wc"]:>6} {m["faq"]:>4} {m["role"]:>5} {m["links_ext"]:>5} {m["nmls"]:>5}  {status}')
        except Exception as e:
            print(f'  /{hub}/{p.stem:<48}  ERROR: {e}')

print('=' * 100)
print(f'TOTAL: {total} sub-pages | CLEAN: {clean} | FLAGGED: {flagged}')
print('=' * 100)

# Per-hub summary
print()
print('PER-HUB SUMMARY')
print('-' * 60)
for hub in HUBS:
    if hub in results:
        cnt = len(results[hub])
        clean_cnt = sum(1 for _, _, f in results[hub] if not f)
        print(f'  /{hub}/: {cnt} pages ({clean_cnt} clean, {cnt - clean_cnt} flagged)')
