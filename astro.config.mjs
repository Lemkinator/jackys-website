// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.jackys-harfe.de',
  integrations: [mdx(), sitemap()],
  // GitHub Pages sends Access-Control-Allow-Origin: * on every static asset
  // by default; giscus's iframe loads our custom theme CSS
  // (public/giscus/*.css) via a crossorigin="anonymous" <link>, which needs
  // that header. Mirror it here so dev/preview behave the same as prod.
  vite: {
    server: { headers: { 'Access-Control-Allow-Origin': '*' } },
    preview: { headers: { 'Access-Control-Allow-Origin': '*' } },
  },
  // Redirect, not a plain rename. The old path is already live/indexed.
  redirects: {
    '/impressum': '/imprint',
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Kumbh Sans',
      cssVariable: '--font-kumbh',
      weights: [400, 700],
    },
  ],
});
