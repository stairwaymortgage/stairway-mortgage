// seo-fit.ts — keep <title> and meta description inside search-result limits.
// Used once in Layout.astro so every page (and every future page) is covered.
// Ahrefs flags titles > 70 chars and descriptions > 160 or < 110 chars.

const BRAND = 'Stairway Mortgage';
const TITLE_MAX = 70;
const DESC_MAX = 160;
const DESC_MIN = 110;

const BRAND_SUFFIX = new RegExp(`\\s*[|—–-]\\s*${BRAND}\\s*$`);
// Separators that join a headline to a tagline, strongest first.
const SEPARATORS = [' | ', ' — ', ' – ', ': '];

function cutAtWord(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max + 1);
  const i = cut.lastIndexOf(' ');
  return (i > max * 0.6 ? cut.slice(0, i) : s.slice(0, max)).replace(/[\s,;:—–|-]+$/, '');
}

/** Shorten a title to <= 70 chars by dropping the brand suffix, then trailing
 *  taglines, then re-adding the brand if it fits. Never rewrites words. */
export function fitTitle(title: string): string {
  const t = (title || '').trim();
  if (t.length <= TITLE_MAX) return t;
  let core = t.replace(BRAND_SUFFIX, '').trim();
  const hadBrand = core !== t;
  if (core.length <= TITLE_MAX) return core;
  // Drop trailing taglines, but never leave a stub shorter than 40 chars —
  // in that case trim the full title at a word boundary instead.
  outer: for (const sep of SEPARATORS) {
    while (core.length > TITLE_MAX && core.includes(sep)) {
      const shorter = core.slice(0, core.lastIndexOf(sep)).trim();
      if (shorter.length < 40) break outer;
      core = shorter;
    }
    if (core.length <= TITLE_MAX) break;
  }
  core = cutAtWord(core, TITLE_MAX);
  const branded = `${core} | ${BRAND}`;
  return hadBrand && branded.length <= TITLE_MAX ? branded : core;
}

function sentences(s: string): string[] {
  return s.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) ?? [s];
}

/** Keep a description between 110 and 160 chars. Long ones lose middle
 *  sentences (an NMLS sentence at the end is always kept); short ones get a
 *  compliant closing line. */
export function fitDescription(desc: string): string {
  let d = (desc || '').replace(/\s+/g, ' ').trim();
  if (d.length > DESC_MAX) {
    const parts = sentences(d);
    const tail = /NMLS/i.test(parts[parts.length - 1]) && parts.length > 1 ? parts.pop()! : '';
    const join = (arr: string[]) => [...arr, tail].filter(Boolean).join(' ');
    while (parts.length > 1 && join(parts).length > DESC_MAX) parts.pop();
    d = join(parts);
    if (d.length > DESC_MAX) {
      const room = DESC_MAX - (tail ? tail.length + 1 : 0) - 1;
      d = [cutAtWord(parts[0], room) + '…', tail].filter(Boolean).join(' ');
    }
  }
  if (d.length < DESC_MIN) {
    const add = /NMLS/i.test(d)
      ? ` Talk to our team at ${BRAND}.`
      : ` Talk to our team at ${BRAND} — NMLS #1072866.`;
    const sep = /[.!?]$/.test(d) ? '' : '.';
    if ((d + sep + add).length <= DESC_MAX) d = d + sep + add;
  }
  return d;
}
