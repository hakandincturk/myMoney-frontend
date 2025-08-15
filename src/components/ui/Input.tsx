import React, { useRef } from 'react'

type InputProps = {
  id: string
  label?: string
  type?: string
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  formatCurrency?: boolean
  currencySymbol?: string
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  className = '',
  required = false,
  disabled = false,
  min,
  max,
  step,
  formatCurrency = false,
  currencySymbol = '₺',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const baseClasses = 'w-full px-4 py-3 rounded-xl transition-all duration-300 bg-white dark:bg-mm-card text-slate-900 dark:text-mm-text border-2 outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary placeholder-slate-400 dark:placeholder-mm-placeholder'
  const borderClasses = error 
    ? 'border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' 
    : 'border-slate-200 dark:border-mm-border hover:border-slate-300 dark:hover:border-mm-border/80'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-mm-disabled' : 'hover:bg-slate-50 dark:hover:bg-mm-cardHover'

  // Para formatı için yardımcı fonksiyonlar
  const formatCurrencyValue = (inputValue: string): string => {
    // Sadece sayıları ve nokta karakterini al
    const numericValue = inputValue.replace(/[^\d.,]/g, '')
    
    // Virgülü noktaya çevir (Türkçe format)
    const normalizedValue = numericValue.replace(',', '.')
    
    // Sayıya çevir
    const number = parseFloat(normalizedValue)
    
    if (isNaN(number)) return ''
    
    // Türkçe para formatı (1.234,56)
    return number.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const parseCurrencyValue = (formattedValue: string): number => {
    // Türkçe formatından sayıya çevir (1.234,56 -> 1234.56)
    const normalizedValue = formattedValue.replace(/\./g, '').replace(',', '.')
    return parseFloat(normalizedValue) || 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (formatCurrency) {
      // Para formatı için sadece sayıları ve virgülü kabul et
      const cleanValue = inputValue.replace(/[^\d,]/g, '')
      onChange(cleanValue)
    } else if (type === 'number') {
      // Normal number input
      onChange(Number(inputValue))
    } else {
      // Normal text input
      onChange(inputValue)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formatCurrency) {
      // Blur olduğunda para formatını uygula
      const currentValue = e.target.value
      if (currentValue) {
        const formattedValue = formatCurrencyValue(currentValue)
        onChange(formattedValue)
      }
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (formatCurrency) {
      // Focus olduğunda formatı temizle, sadece sayıları göster
      const currentValue = e.target.value
      if (currentValue) {
        // Formatı temizle (1.234,56 -> 1234,56)
        const cleanValue = currentValue.replace(/\./g, '').replace(',', '.')
        const number = parseFloat(cleanValue)
        if (!isNaN(number)) {
          onChange(number.toString())
        }
      }
    }
  }

  // Para formatı için display value
  const displayValue = formatCurrency && typeof value === 'string' ? value : value

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {formatCurrency && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-mm-placeholder font-medium">
            {currencySymbol}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type={formatCurrency ? 'text' : type}
          className={`${baseClasses} ${borderClasses} ${disabledClasses} ${formatCurrency ? 'pl-8' : ''}`}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-400 dark:text-red-300">{error}</p>
      )}
    </div>
  )
}

export default Input
