// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  // Desplegado en Cloudflare Workers (Static Assets): base '/' y salida estática, sin adaptador.
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [mdx()],
});
