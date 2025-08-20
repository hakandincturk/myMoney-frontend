import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Dil dosyalarını import et
import tr from './locales/tr.json'
import en from './locales/en.json'

const resources = {
  tr: {
    translation: tr
  },
  en: {
    translation: en
  }
}

i18n
  // Tarayıcı dilini otomatik algıla
  .use(LanguageDetector)
  // React için i18next'i başlat
  .use(initReactI18next)
  // i18next'i başlat
  .init({
    resources,
    fallbackLng: 'tr', // Varsayılan dil
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  })

export default i18n
