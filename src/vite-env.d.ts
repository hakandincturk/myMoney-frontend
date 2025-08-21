/// <reference types="vite/client" />

// Global cache configuration variables
declare global {
  const __ENABLE_CACHE__: boolean
  const __CONTACT_CACHE_DURATION__: number
  const __ACCOUNT_CACHE_DURATION__: number
  const __TRANSACTION_CACHE_DURATION__: number
  const __DETAIL_CACHE_DURATION__: number
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
