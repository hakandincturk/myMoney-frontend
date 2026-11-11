// Environment Configuration
export const ENV_CONFIG = {
  // Development mode check
  isDevelopment: () => import.meta.env.DEV,
  
  // Production mode check
  isProduction: () => import.meta.env.PROD,
  
  // Get current mode
  getMode: () => import.meta.env.MODE,
  
  // API base URL
  getApiBaseUrl: () => import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Debug info
  getDebugInfo: () => ({
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api'
  })
}

// Development'ta environment bilgilerini console'da göster
if (ENV_CONFIG.isDevelopment()) {
  console.log('🌍 Environment Configuration:', ENV_CONFIG.getDebugInfo())
}
