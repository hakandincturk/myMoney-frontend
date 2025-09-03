# 500 Hata Yönetimi Sistemi

Bu dokümantasyon, uygulamada 500 (Internal Server Error) hatalarının nasıl yönetildiğini açıklar.

## Sistem Genel Bakış

### Merkezi Hata Yönetimi
- Tüm API çağrıları `baseQueryWithReauth` fonksiyonu üzerinden geçer
- 500 hataları otomatik olarak yakalanır ve kullanıcıya toast mesajı gösterilir
- Development ve production modları için farklı davranışlar sergiler

### Dosya Yapısı
```
src/
├── config/
│   └── environment.ts         # Environment config ve development mode tespiti
├── services/
│   └── baseApi.ts            # Merkezi hata yönetimi ve RTK Query base
└── components/ui/
    ├── Toast.tsx             # Multi-line mesaj desteği ile toast komponenti
    └── ToastContainer.tsx    # Toast container
```

## Development vs Production Modları

### Production Modu
```json
{
  "type": false,
  "message": "Could not resolve attribute 'is_removed' of 'com.hakandincturk.models.Contact'",
  "timestamp": "2025-09-01T22:36:10.935732",
  "data": {
    "path": "/api/contact/my/active"
  }
}
```

**Kullanıcıya gösterilen:** Sadece `message` kısmı
```
Could not resolve attribute 'is_removed' of 'com.hakandincturk.models.Contact'
```

### Development Modu

**Kullanıcıya gösterilen:** `message` + `data` detayları
```
Could not resolve attribute 'is_removed' of 'com.hakandincturk.models.Contact'

DEBUG INFO:
{
  "path": "/api/contact/my/active"
}
```

**Console'da da loglanır:**
```javascript
🚨 Server Error (500): {
  url: "/api/contact/my/active",
  method: "GET",
  errorData: {...},
  timestamp: "2025-09-01T22:36:10.935732"
}
```

## Kod Yapısı

### Environment Config
```typescript
// src/config/environment.ts
export const ENV_CONFIG = {
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getMode: () => import.meta.env.MODE,
  // ...
}
```

### Base API Error Handler
```typescript
// src/services/baseApi.ts
const showServerErrorToast = (errorData: any) => {
  const mainMessage = errorData?.message || 'Sunucu hatası oluştu'
  
  let fullMessage = mainMessage
  if (ENV_CONFIG.isDevelopment() && errorData?.data) {
    const debugInfo = JSON.stringify(errorData.data, null, 2)
    fullMessage = `${mainMessage}\n\nDEBUG INFO:\n${debugInfo}`
  }

  // Toast event'ini gönder
  window.dispatchEvent(new CustomEvent('showToast', {
    detail: {
      message: fullMessage,
      type: 'error',
      duration: ENV_CONFIG.isDevelopment() ? 10000 : 5000
    }
  }))
}

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error) {
    const status = result.error.status
    const errorData = result.error.data

    if (status === 500) {
      showServerErrorToast(errorData)
      
      if (ENV_CONFIG.isDevelopment()) {
        console.error('🚨 Server Error (500):', {
          url: typeof args === 'string' ? args : args.url,
          method: typeof args === 'object' ? args.method : 'GET',
          errorData,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
  
  return result
}
```

### Toast Component
Multi-line mesajları destekler:
```typescript
// src/components/ui/Toast.tsx
<div className="flex-1 text-sm font-medium break-words">
  {message.split('\n').map((line, index) => (
    <div key={index} className={index > 0 ? 'mt-2' : ''}>
      {line}
    </div>
  ))}
</div>
```

## Özellikler

### 🎯 Otomatik Hata Yakalama
- Tüm RTK Query API çağrıları için merkezi hata yakalama
- 500 hataları otomatik olarak toast olarak gösteriliyor

### 🔧 Development Debug Desteği
- Development modunda detaylı hata bilgileri
- Console logging ile debug kolaylığı
- Daha uzun toast süresi (10 saniye)

### 🎨 Gelişmiş Toast UI
- Multi-line mesaj desteği
- Newline karakterleri ile satır arası
- Progress bar ile otomatik kapanma
- Responsive tasarım (max-width: 600px)

### 🌍 Environment Aware
- Development/Production mod tespiti
- Mod bazlı farklı davranışlar
- Environment variables desteği

## Test Etme

Development modunda 500 hatalarını test etmek için:

1. Network tab'ında API çağrısını "Fail" olarak işaretle
2. Veya backend'de geçici olarak 500 döndüren endpoint oluştur
3. Browser console'ında custom event gönder:

```javascript
// Manuel test için
window.dispatchEvent(new CustomEvent('showToast', {
  detail: {
    message: "Test message\n\nDEBUG INFO:\n{\n  \"path\": \"/api/test\"\n}",
    type: 'error',
    duration: 10000
  }
}))
```

## Gelecek Geliştirmeler

- [ ] Hata raporlama servisi entegrasyonu
- [ ] Retry mekanizması
- [ ] Offline/online durum yönetimi
- [ ] Kullanıcı feedback sistemi
- [ ] Hata kategorizasyonu (network, server, validation)

## SSS

**S: Production'da debug bilgileri neden gösterilmiyor?**
C: Güvenlik nedeniyle production'da sadece kullanıcı dostu mesajlar gösteriliyor. Debug bilgileri potansiyel güvenlik açıklarına neden olabilir.

**S: Toast mesajları çok uzun görünüyor. Nasıl kısaltabilirim?**
C: `Toast.tsx` dosyasındaki `max-w-[600px]` değerini değiştirebilir veya message'ı truncate edebilirsiniz.

**S: 500 dışındaki hataları da yakalayabilir miyim?**
C: Evet, `baseQueryWithReauth` fonksiyonuna yeni status kodları için condition'lar ekleyebilirsiniz.
