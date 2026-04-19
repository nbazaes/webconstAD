import { defineConfig } from 'astro/config'

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
})
