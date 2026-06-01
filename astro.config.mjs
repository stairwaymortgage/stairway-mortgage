import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://stairwaymortgage.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  redirects: {
    '/2025/11/05/dscr-loan-meaning/': '/blog/dscr-loan-meaning/',
    '/2025/07/29/house-hacking/': '/blog/house-hacking/',
    '/2025/07/29/buying-your-first-home/': '/blog/buying-your-first-home/',
    '/2025/05/11/mortgage-preapproval/': '/blog/mortgage-preapproval/',
    '/2025/05/11/apply-for-mortgage/': '/blog/apply-for-mortgage/',
    '/2025/05/21/passive-income-investments/': '/blog/passive-income-investments/',
    '/2025/07/04/long-term-rental-vs-short-term-rental/': '/blog/long-term-rental-vs-short-term-rental/',
    '/2025/07/05/brrrr-method/': '/blog/brrrr-method/',
    '/2025/07/09/vision-board-examples/': '/blog/vision-board-examples/',
    '/2025/11/05/first-time-home-buyer-mistakes/': '/blog/first-time-home-buyer-mistakes/',
    '/2025/11/03/final-walkthrough-before-closing/': '/blog/final-walkthrough-before-closing/',
    '/2025/11/05/moving-out-of-state/': '/blog/moving-out-of-state/',
    '/2025/11/05/cash-out-refinance-vs-heloc/': '/blog/cash-out-refinance-vs-heloc/',
    '/2025/11/05/retirement-income-planning/': '/blog/retirement-income-planning/',
    '/2025/11/05/downsizing-home-for-seniors/': '/blog/downsizing-home-for-seniors/',
    '/2025/11/05/best-way-to-earn-a-passive-income/': '/blog/best-way-to-earn-a-passive-income/',
  },
});
