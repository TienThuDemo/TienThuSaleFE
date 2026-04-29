import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@constants': '/src/constants',
      '@models': '/src/models',
    },
  },
  server: {
    watch: {
      // json-server ghi db.json khi PATCH/POST → không để Vite reload
      ignored: ['**/db.json'],
    },
  },
})
