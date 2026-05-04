import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import icon from 'astro-icon'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  base: '/',
  site: process.env.PUBLIC_SITE_URL || 'https://constantdigitales.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  build: {
    format: 'directory',
    assetsInlineLimit: 0,
  },

  server: {
    host: true,
  },

  integrations: [
    icon(),
    sitemap({
      filter: (page) => !page.includes('/cuenta/') && !page.includes('/publicar/'),
    }),
  ],
})
