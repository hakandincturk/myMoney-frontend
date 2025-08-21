// Cache Configuration
export const CACHE_CONFIG = {
  // Cache aktif mi?
  ENABLED: __ENABLE_CACHE__,
  
  // Cache süreleri (saniye)
  DURATIONS: {
    CONTACT: __CONTACT_CACHE_DURATION__,
    ACCOUNT: __ACCOUNT_CACHE_DURATION__,
    TRANSACTION: __TRANSACTION_CACHE_DURATION__,
    DETAIL: __DETAIL_CACHE_DURATION__,
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
