import { defineConfig } from 'astro/config'

import icon from 'astro-icon';

export default defineConfig({
  base: '/',
  output: 'static',
  outDir: '../web/static/frontend',

  build: {
    format: 'directory',
  },

  server: {
    host: true,
  },

  integrations: [icon()],
})