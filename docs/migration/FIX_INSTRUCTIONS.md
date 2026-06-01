# Fix: move the deployed blog post to /blog/ + add 301 redirect

The first deploy put the blog post at the OLD dated URL `/2025/11/05/dscr-loan-meaning/`.
Per the locked URL hierarchy, blog posts live at `/blog/{slug}/`. This corrects that one page
and sets up the 301 so the old URL still resolves (and passes ranking equity).

## Steps for Claude Code

1. Add the relocated page:
   - Copy `src/pages/blog/dscr-loan-meaning.astro` (in this bundle) into the repo at
     `src/pages/blog/dscr-loan-meaning.astro`.
   - DELETE the old file: `src/pages/2025/11/05/dscr-loan-meaning.astro`
     (and remove now-empty `src/pages/2025/` if empty).

2. Add the 301 redirect to `astro.config.mjs`:
   - Open `blog_redirects_block.txt` in this bundle. For now we only need the ONE live post's
     redirect, but the file contains all 150 (for when the full blog batch lands).
   - Add a `redirects` key to the config. Minimum for this fix:
     ```js
     export default defineConfig({
       // ...existing config (sitemap, tailwind, etc.) ...
       redirects: {
         '/2025/11/05/dscr-loan-meaning/': '/blog/dscr-loan-meaning/',
       },
     });
     ```
   - If `astro.config.mjs` already has other keys, just add the `redirects` key alongside them —
     don't remove anything (keep @astrojs/sitemap, integrations, etc.).

3. Local build to confirm:
   ```
   npm run build
   ```
   Expect `/blog/dscr-loan-meaning/` to generate, and the old `/2025/11/05/...` route to be
   gone from the build output (it becomes a redirect, not a page). Report any error; don't push on error.

4. Deploy (git push to master only, authored by Jim — no vercel build/deploy --prebuilt):
   ```
   git add -A
   git commit -m "Move blog post to /blog/ slug + 301 from dated URL"
   git push origin master
   ```

5. Verify after deploy:
   - https://stairway-vercel.vercel.app/blog/dscr-loan-meaning/  → 200, renders with styling
   - https://stairway-vercel.vercel.app/2025/11/05/dscr-loan-meaning/  → should 301-redirect to the /blog/ URL

## Note for the full blog batch (later)
When all 150 posts are migrated, paste the FULL contents of `blog_redirects_block.txt` as the
`redirects` object in astro.config.mjs (all 150 dated→/blog/ entries). Generated from the export —
do not hand-type. `URL_Hierarchy_Spec.md` in this bundle is the canonical reference for all page URLs.
