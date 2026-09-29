import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

const site = process.env.PUBLIC_SITE_ORIGIN ?? 'https://testheon.com';

export default defineConfig({
  site,
  base: '/practice',
  trailingSlash: 'always',
  output: 'static',
  integrations: [preact()],
  build: {
    assets: '_astro',
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
