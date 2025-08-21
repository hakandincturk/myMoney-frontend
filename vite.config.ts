import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Environment variables'ları yükle
  const env = loadEnv(mode, '.', '')
  
  return {
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
    // Environment variables'ları client'a expose et
    define: {
      __ENABLE_CACHE__: JSON.stringify(env.VITE_ENABLE_CACHE === 'true' || mode === 'production'),
      __CONTACT_CACHE_DURATION__: JSON.stringify(parseInt(env.VITE_CONTACT_CACHE_DURATION) || 1800),
      __ACCOUNT_CACHE_DURATION__: JSON.stringify(parseInt(env.VITE_ACCOUNT_CACHE_DURATION) || 1800),
      __TRANSACTION_CACHE_DURATION__: JSON.stringify(parseInt(env.VITE_TRANSACTION_CACHE_DURATION) || 1800),
      __DETAIL_CACHE_DURATION__: JSON.stringify(parseInt(env.VITE_DETAIL_CACHE_DURATION) || 3600),
    },
  }
})


