import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'ES2022',
    outDir: 'dist',
    sourcemap: true,
  },
})


