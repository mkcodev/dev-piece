// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://devpiece.vercel.app',
  output: 'static',
  integrations: [
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-frappe',
      langs: ['bash', 'powershell', 'json', 'lua', 'viml', 'typescript', 'toml', 'yaml', 'javascript'],
      wrap: false,
    },
  },
});
