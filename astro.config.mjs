// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // Al desplegar en GitHub Pages: site: 'https://<usuario>.github.io', base: '/<repo>'
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx()],
});
