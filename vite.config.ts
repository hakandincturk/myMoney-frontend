import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Environment variables'ları yükle
  const env = loadEnv(mode, '.', '')
  const apiProxy = {
    target: env.VITE_DEV_API_TARGET || 'http://127.0.0.1:8090',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // Dev and preview mirror production's same-origin setup: the SPA calls /api and Vite forwards it
    // to the backend (which has no /api context path locally). Needed because the session cookie is
    // SameSite=Strict and localhost:5174 -> 127.0.0.1:8090 would be cross-site.
    server: {
      port: 5173,
      host: true,
      proxy: { '/api': apiProxy },
    },
    preview: {
      proxy: { '/api': apiProxy },
    },
    build: {
      target: 'ES2022',
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['chart.js', 'react-chartjs-2'],
            i18n: ['i18next', 'react-i18next']
          },
        },
      },
    },

  }
})


