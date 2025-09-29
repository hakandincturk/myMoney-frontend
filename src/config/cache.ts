// Cache Configuration
export const CACHE_CONFIG = {
  // Cache aktif mi? Production'da dahi env ile kapatılabilir
  ENABLED: (import.meta.env.VITE_ENABLE_CACHE ?? (import.meta.env.MODE === 'production' ? 'true' : 'false')) === 'true',
  
  // Cache süreleri (saniye)
  DURATIONS: {
    CONTACT: parseInt(import.meta.env.VITE_CONTACT_CACHE_DURATION) || 1800,
    ACCOUNT: parseInt(import.meta.env.VITE_ACCOUNT_CACHE_DURATION) || 1800,
    TRANSACTION: parseInt(import.meta.env.VITE_TRANSACTION_CACHE_DURATION) || 1800,
    DETAIL: parseInt(import.meta.env.VITE_DETAIL_CACHE_DURATION) || 3600,
  },
  
  // Cache sürelerini milisaniyeye çevir
  getDurationsInMs() {
    return {
      contact: this.DURATIONS.CONTACT * 1000,
      account: this.DURATIONS.ACCOUNT * 1000,
      transaction: this.DURATIONS.TRANSACTION * 1000,
      detail: this.DURATIONS.DETAIL * 1000,
    }
  },
  
  // Cache aktif mi kontrol et
  isEnabled() {
    return this.ENABLED === true
  },
  
  // Debug bilgisi
  getDebugInfo() {
    return {
      enabled: this.ENABLED,
      durations: this.DURATIONS,
      durationsMs: this.getDurationsInMs(),
    }
  },
}

// Development'ta cache konfigürasyonunu console'da göster
if (import.meta.env.DEV) {
  console.log('🔧 Cache Configuration:', CACHE_CONFIG.getDebugInfo())
  console.log('📱 Cache Enabled:', CACHE_CONFIG.isEnabled() ? '✅ YES' : '❌ NO')
}
