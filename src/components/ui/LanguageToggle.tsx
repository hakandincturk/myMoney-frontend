import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

type Props = { className?: string; size?: 'default' | 'compact' }

export const LanguageToggle: React.FC<Props> = ({ className = '', size = 'default' }) => {
  const { i18n } = useTranslation()
  
  const currentLanguage = i18n.language
  const isTurkish = currentLanguage === 'tr'
  
  const toggleLanguage = () => {
    const newLang = isTurkish ? 'en' : 'tr'
    i18n.changeLanguage(newLang)
  }
  
  return (
    <Button
      type="button"
      onClick={toggleLanguage}
      variant="secondary"
      aria-label="Dil değiştir / Change language"
      className={`inline-flex items-center gap-2 rounded-lg ${size === 'compact' ? 'h-10 w-10 p-0 text-base justify-center' : 'px-3 py-2 text-sm'} transition-colors ${
        isTurkish
          ? 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
          : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
      } ${className}`}
    >
      {isTurkish ? (
        size === 'compact' ? (
          <span role="img" aria-label="Türkçe">🇹🇷</span>
        ) : (
          <>
            <span>🇹🇷</span>
            <span>TR</span>
          </>
        )
      ) : (
        size === 'compact' ? (
          <span role="img" aria-label="English">🇺🇸</span>
        ) : (
          <>
            <span>🇺🇸</span>
            <span>EN</span>
          </>
        )
      )}
    </Button>
  )
}

export default LanguageToggle
