import { fileURLToPath, URL } from 'node:url'
// vite.config.ts
import Components from 'unplugin-vue-components/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), Components({ dirs: ['./src/components'] })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
