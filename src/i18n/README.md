# i18n (Internationalization) Kullanım Kılavuzu

Bu proje i18next kullanarak çoklu dil desteği sağlar.

## Kurulum

Gerekli paketler yüklenmiştir:
- `i18next`: Ana i18n kütüphanesi
- `react-i18next`: React entegrasyonu
- `i18next-browser-languagedetector`: Tarayıcı dili otomatik algılama

## Kullanım

### 1. Component'te i18n Kullanımı

```typescript
import { useTranslation } from 'react-i18next'

export const MyComponent: React.FC = () => {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.title')}</h1>
      <p>{t('common.description')}</p>
    </div>
  )
}
```

### 2. Dil Değiştirme

```typescript
import { useTranslation } from 'react-i18next'

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }
  
  return (
    <button onClick={() => changeLanguage('en')}>
      English
    </button>
  )
}
```

### 3. Interpolation (Değişken Kullanımı)

```typescript
// Dil dosyasında
{
  "validation": {
    "minLength": "En az {{min}} karakter olmalıdır"
  }
}

// Component'te
{t('validation.minLength', { min: 6 })}
```

### 4. Pluralization (Çoğul)

```typescript
// Dil dosyasında
{
  "items": {
    "one": "{{count}} öğe",
    "other": "{{count}} öğe"
  }
}

// Component'te
{t('items', { count: 5 })}
```

## Dil Dosyaları

### Türkçe: `src/i18n/locales/tr.json`
### İngilizce: `src/i18n/locales/en.json`

## Yapı

Dil dosyaları mantıklı kategorilere ayrılmıştır:

- `common`: Genel kullanım
- `navigation`: Navigasyon menüleri
- `auth`: Kimlik doğrulama
- `status`: Durum metinleri
- `transaction`: İşlem ile ilgili
- `account`: Hesap ile ilgili
- `contact`: Kişi ile ilgili
- `table`: Tablo bileşenleri
- `validation`: Form validasyon mesajları
- `messages`: Genel mesajlar

## Yeni Dil Ekleme

1. `src/i18n/locales/` klasörüne yeni dil dosyası ekle
2. `src/i18n/index.ts`'te resources'a ekle
3. Gerekirse fallbackLng'i güncelle

## Best Practices

1. **Anahtar İsimlendirme**: Nokta notasyonu kullan (örn: `common.save`)
2. **Kategorilendirme**: İlgili metinleri mantıklı gruplarda topla
3. **Tutarlılık**: Tüm dillerde aynı anahtar yapısını kullan
4. **Context**: Metinlerin kullanıldığı yeri göz önünde bulundur
5. **Test**: Dil değişikliklerini test et

## Örnek Kullanım

```typescript
// Basit metin
{t('common.save')}

// Değişken ile
{t('validation.minLength', { min: 6 })}

// Nested key
{t('transaction.types.debt')}

// Conditional rendering
{currentLanguage === 'tr' ? t('common.yes') : t('common.no')}
```
