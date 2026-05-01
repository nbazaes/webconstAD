import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import icon from 'astro-icon'

export default defineConfig({
  base: '/',
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  build: {
    format: 'directory',
  },

  server: {
    host: true,
  },

  integrations: [icon()],
})
