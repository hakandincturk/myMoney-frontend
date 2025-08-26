import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type DatePickerProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  required = false,
  disabled = false,
  min,
  max,
}) => {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00') // Timezone sorununu çözmek için
      return isNaN(date.getTime()) ? new Date() : date
    }
    return new Date()
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value + 'T00:00:00') : null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsMonthDropdownOpen(false)
        setIsYearDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ay navigasyonu
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Bugünün tarihini seç
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    // Timezone sorununu çözmek için local date string kullan
    const localDate = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0')
    onChange(localDate)
    setIsOpen(false)
  }

  // Tarih seç
  const selectDate = (date: Date) => {
    setSelectedDate(date)
    // Timezone sorununu çözmek için local date string kullan
    const localDate = date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0')
    onChange(localDate)
    setIsOpen(false)
  }

  // Takvim günlerini oluştur
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Pazartesi'den başlayacak şekilde ayarla (0 = Pazartesi, 6 = Pazar)
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6 // Pazar günü için
    
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startOffset)
    
    const days = []
    const currentDateObj = new Date(startDate)
    
    while (currentDateObj <= lastDay || days.length < 42) {
      days.push(new Date(currentDateObj))
      currentDateObj.setDate(currentDateObj.getDate() + 1)
    }
    
    return days
  }

  // Ay adını al
  const getMonthName = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', year: 'numeric' })
  }

  // Gün adlarını al
  const getDayNames = () => {
    if (i18n.language === 'tr') {
      return ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'] // Pazartesi'den Pazar'a
    } else {
      return ['M', 'T', 'W', 'T', 'F', 'S', 'S'] // Monday to Sunday
    }
  }

  // Tarih formatını kontrol et
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const baseClasses = 'w-full px-4 py-3 rounded-xl transition-all duration-300 bg-white dark:bg-gray-800 text-slate-900 dark:text-mm-text border-2 outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary placeholder-slate-400 dark:placeholder-mm-placeholder'
  const borderClasses = error 
    ? 'border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' 
    : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-gray-700' : 'hover:bg-slate-50 dark:hover:bg-gray-700'

  return (
    <div className={`w-full relative ${className}`} ref={datePickerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={id}
          type="text"
          className={`${baseClasses} ${borderClasses} ${disabledClasses} cursor-pointer`}
          placeholder={placeholder}
          value={value ? new Date(value + 'T00:00:00').toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : ''}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        />
        
        {/* Takvim ikonu */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-mm-placeholder">
          📅
        </div>
      </div>

      {/* Hata mesajı */}
      {error && (
        <p className="mt-1 text-xs text-red-400 dark:text-red-300">{error}</p>
      )}

      {/* Takvim dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-800 flex flex-col sm:absolute sm:inset-auto sm:w-80 sm:top-full sm:left-0 sm:mt-2 sm:rounded-xl  sm:shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 sm:bg-transparent sm:dark:bg-transparent sm:p-3">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-3 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-lg sm:p-2 sm:text-base"
            >
              ←
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-2">
              {/* Ay seçici */}
              <div className="relative">
                <button
                  type="button"
                  className="text-lg font-bold text-slate-900 dark:text-mm-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 sm:text-base sm:font-semibold flex items-center"
                  onClick={() => {
                    setIsMonthDropdownOpen(!isMonthDropdownOpen)
                    setIsYearDropdownOpen(false)
                  }}
                >
                  {currentDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' })}
                  <span className="ml-1 text-sm">▼</span>
                </button>
                
                {/* Ay dropdown */}
                {isMonthDropdownOpen && (
									<div 
									ref={(el) => {
											if (el) {
												// Seçili ayı ortala
												const activeIndex = currentDate.getMonth()
												const itemHeight = 40 // py-2 + text height
												const containerHeight = 192 // max-h-48
												const scrollTop = Math.max(0, (activeIndex * itemHeight) - (containerHeight / 2) + (itemHeight / 2))
												el.scrollTop = scrollTop
											}
										}}
										className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-36 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthDate = new Date(2000, i, 1)
                      const monthName = monthDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' })
                      const isActive = i === currentDate.getMonth()
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            setCurrentDate(new Date(currentDate.getFullYear(), i, 1))
                            setIsMonthDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            isActive ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' : ''
                          }`}
                        >
                          {monthName}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Yıl seçici */}
              <div className="relative">
                <button
                  type="button"
                  className="text-lg font-bold text-slate-900 dark:text-mm-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 sm:text-base sm:font-semibold flex items-center"
                  onClick={() => {
                    setIsYearDropdownOpen(!isYearDropdownOpen)
                    setIsMonthDropdownOpen(false)
                  }}
                >
                  {currentDate.getFullYear()}
                  <span className="ml-1 text-sm">▼</span>
                </button>
                
                {/* Yıl dropdown */}
                {isYearDropdownOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-24 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto">
                    {Array.from({ length: 21 }, (_, i) => {
                      const year = currentDate.getFullYear() - 10 + i
                      const isActive = year === currentDate.getFullYear()
                      return (
                        <button
                          type="button"
                          key={year}
                          onClick={() => {
                            setCurrentDate(new Date(year, currentDate.getMonth(), 1))
                            setIsYearDropdownOpen(false)
                          }}
                          className={`w-full text-center px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            isActive ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium' : ''
                          }`}
                        >
                          {year}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-3 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-lg sm:p-2 sm:text-base"
            >
              →
            </button>
            
            {/* Mobilde kapatma butonu */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-3 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-lg sm:hidden ml-2"
            >
              ✕
            </button>
          </div>

          {/* Takvim alanı - mobilde ortada ve flex-1 */}
          <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-2 sm:py-0 sm:flex-none">
            {/* Gün adları */}
            <div className="grid grid-cols-7 gap-1 mb-4 sm:gap-0.5 sm:mb-2 sm:pt-2">
              {getDayNames().map((day, index) => (
                <div key={index} className="text-center text-sm font-semibold text-slate-600 dark:text-mm-subtleText py-3 sm:text-xs sm:py-1 sm:font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Takvim günleri */}
            <div className="grid grid-cols-7 gap-1 sm:gap-0.5">
              {getCalendarDays().map((date, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => selectDate(date)}
                  className={`
                    p-3 text-base rounded-xl transition-all duration-200 hover:bg-slate-100 dark:hover:bg-gray-700 min-h-[48px] aspect-square font-medium
                    sm:p-1 sm:text-xs sm:rounded sm:min-h-[28px]
                    ${isCurrentMonth(date) ? 'text-slate-900 dark:text-mm-text' : 'text-slate-400 dark:text-gray-500'}
                    ${isSelected(date) ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : ''}
                    ${isToday(date) && !isSelected(date) ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-2 border-blue-300 dark:border-blue-600' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center gap-4 p-6 border-t border-slate-100 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 sm:justify-between sm:gap-0 sm:p-3 sm:bg-transparent sm:dark:bg-transparent">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null)
                onChange('')
                setIsOpen(false)
              }}
              className="px-6 py-3 bg-white dark:bg-gray-700 text-slate-700 dark:text-mm-text hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors rounded-xl font-medium border border-slate-200 dark:border-gray-600 sm:px-2 sm:py-1 sm:bg-transparent sm:border-none sm:text-xs sm:text-slate-500 sm:dark:text-mm-subtleText"
            >
              {t('common.clear')}
            </button>
            
            <button
              type="button"
              onClick={goToToday}
              className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-xl font-medium shadow-lg sm:px-2 sm:py-1 sm:bg-transparent sm:shadow-none sm:text-xs sm:text-blue-600 sm:dark:text-blue-400"
            >
              {t('common.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
