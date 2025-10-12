import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
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
  // Sadece belirli kullanımlarda (ör. taksit ödeme modalı) açılırı portal ile body'ye taşı
  usePortal?: boolean
  // Portal z-index'i özelleştir (modal üstünde görünmesi için)
  dropdownZIndex?: number
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
  usePortal = false,
  dropdownZIndex,
}) => {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [autoDirection, setAutoDirection] = useState<'down' | 'up'>('down')
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const date = new Date(value + 'T00:00:00') // Timezone sorununu çözmek için
      return isNaN(date.getTime()) ? new Date() : date
    }
    return new Date()
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value + 'T00:00:00') : null)
  // Görüntülenecek metin (kullanıcının yazdığı veya selectedDate'ten türetilmiş)
  const [inputText, setInputText] = useState<string>(() => {
    if (!value) return ''
    const date = new Date(value + 'T00:00:00')
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')
  })
  const datePickerRef = useRef<HTMLDivElement>(null)
  const portalContainerRef = useRef<HTMLDivElement>(null)
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 })
  const portalZ = dropdownZIndex ?? 10010

  // Dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedInsideInputArea = !!(datePickerRef.current && datePickerRef.current.contains(target))
      const clickedInsidePortal = !!(usePortal && portalContainerRef.current && portalContainerRef.current.contains(target))
      if (clickedInsideInputArea || clickedInsidePortal) {
        return
      }
      setIsOpen(false)
      setIsMonthDropdownOpen(false)
      setIsYearDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [usePortal])

  // Dışarıdan value veya dil değiştiğinde inputText'i senkronize et
  useEffect(() => {
    if (!value) {
      setInputText('')
      return
    }
    const date = new Date(value + 'T00:00:00')
    if (!isNaN(date.getTime())) {
      setInputText(date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US'))
    }
  }, [value, i18n.language])

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

  // Kullanıcı girdisini tarihe çevir (yyyy-mm-dd)
  const parseUserDate = (text: string): string | null => {
    if (!text) return ''
    const trimmed = text.trim()
    // Her zaman destekle: yyyy-mm-dd
    const iso = /^\d{4}-\d{2}-\d{2}$/
    if (iso.test(trimmed)) {
      const d = new Date(trimmed + 'T00:00:00')
      if (!isNaN(d.getTime())) return trimmed
      return null
    }

    // TR: dd.mm.yyyy veya dd/mm/yyyy
    if (i18n.language === 'tr') {
      const m = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/)
      if (m) {
        const day = parseInt(m[1], 10)
        const month = parseInt(m[2], 10)
        const year = parseInt(m[3], 10)
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const candidate = new Date(year, month - 1, day)
          if (candidate.getMonth() === month - 1 && candidate.getDate() === day && candidate.getFullYear() === year) {
            const y = String(year)
            const m2 = String(month).padStart(2, '0')
            const d2 = String(day).padStart(2, '0')
            return `${y}-${m2}-${d2}`
          }
        }
        return null
      }
    }

    // EN: mm/dd/yyyy veya m/d/yyyy
    const mEn = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (mEn) {
      const month = parseInt(mEn[1], 10)
      const day = parseInt(mEn[2], 10)
      const year = parseInt(mEn[3], 10)
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const candidate = new Date(year, month - 1, day)
        if (candidate.getMonth() === month - 1 && candidate.getDate() === day && candidate.getFullYear() === year) {
          const y = String(year)
          const m2 = String(month).padStart(2, '0')
          const d2 = String(day).padStart(2, '0')
          return `${y}-${m2}-${d2}`
        }
      }
      return null
    }

    // Son çare: Date.parse dene (locale bağımsız güvenilir değil, ama destek)
    const fallback = new Date(trimmed)
    if (!isNaN(fallback.getTime())) {
      const y = fallback.getFullYear()
      const m = String(fallback.getMonth() + 1).padStart(2, '0')
      const d = String(fallback.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    return null
  }

  const isWithinBounds = (yyyyMmDd: string): boolean => {
    if (!yyyyMmDd) return true
    if (!min && !max) return true
    const val = new Date(yyyyMmDd + 'T00:00:00').getTime()
    if (min) {
      const minT = new Date(min + 'T00:00:00').getTime()
      if (val < minT) return false
    }
    if (max) {
      const maxT = new Date(max + 'T00:00:00').getTime()
      if (val > maxT) return false
    }
    return true
  }

  const commitInputText = () => {
    const parsed = parseUserDate(inputText)
    if (parsed === '') {
      setSelectedDate(null)
      onChange('')
      return
    }
    if (parsed && isWithinBounds(parsed)) {
      const d = new Date(parsed + 'T00:00:00')
      setSelectedDate(d)
      setCurrentDate(d)
      onChange(parsed)
      // Görüntüyü locale'e göre normalize et
      setInputText(d.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US'))
    } else {
      // Geçersizse state'i koru, onChange çağırma
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

  // Portal pozisyonunu güncelle
  const updatePortalPosition = () => {
    if (!datePickerRef.current) return
    const rect = datePickerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const estimatedMenuHeight = 360
    const shouldOpenUp = spaceBelow < Math.min(estimatedMenuHeight, viewportHeight * 0.4) && spaceAbove > spaceBelow
    setAutoDirection(shouldOpenUp ? 'up' : 'down')
    const top = shouldOpenUp ? Math.max(8, rect.top - Math.min(estimatedMenuHeight, spaceAbove - 8)) : Math.min(viewportHeight - 8, rect.bottom)
    setPortalCoords({ top, left: Math.max(8, rect.left), width: Math.max(280, Math.min(320, rect.width)) })
  }

  useEffect(() => {
    if (!usePortal || !isOpen) return
    updatePortalPosition()
    const handler = () => updatePortalPosition()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [usePortal, isOpen])

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
          className={`${baseClasses} ${borderClasses} ${disabledClasses}`}
          placeholder={placeholder}
          value={inputText}
          onChange={(e) => {
            if (disabled) return
            setInputText(e.target.value)
          }}
          onBlur={() => {
            if (disabled) return
            commitInputText()
          }}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === 'Enter') {
              e.preventDefault()
              commitInputText()
            }
          }}
          disabled={disabled}
        />
        
        {/* Takvim ikonu */}
        <button
          type="button"
          onClick={() => {
            if (disabled) return
            if (usePortal) {
              updatePortalPosition()
            } else if (datePickerRef.current) {
              const rect = datePickerRef.current.getBoundingClientRect()
              const viewportHeight = window.innerHeight
              const spaceBelow = viewportHeight - rect.bottom
              const spaceAbove = rect.top
              const estimatedMenuHeight = 360
              const shouldOpenUp = spaceBelow < Math.min(estimatedMenuHeight, viewportHeight * 0.4) && spaceAbove > spaceBelow
              setAutoDirection(shouldOpenUp ? 'up' : 'down')
            }
            setIsOpen(!isOpen)
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-mm-placeholder"
          aria-label="Open calendar"
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
        </button>
      </div>

      {/* Hata mesajı */}
      {error && (
        <p className="mt-1 text-xs text-red-400 dark:text-red-300">{error}</p>
      )}

      {/* Takvim dropdown */}
      {isOpen && !usePortal && (
        <div className={`fixed inset-0 z-[9999] bg-white dark:bg-gray-800 flex flex-col sm:absolute sm:inset-auto sm:w-80 sm:left-0 sm:rounded-xl sm:shadow-2xl ${autoDirection === 'up' ? 'sm:bottom-full sm:mb-2' : 'sm:top-full sm:mt-2'}`}>
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
										className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-36 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto custom-scrollbar"
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
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-24 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto custom-scrollbar"
                    ref={(el) => {
                      if (el) {
                        const activeIndex = 10 // current year is at middle (current-10 .. current+10)
                        const itemHeight = 40
                        const containerHeight = 192
                        const scrollTop = Math.max(0, (activeIndex * itemHeight) - (containerHeight / 2) + (itemHeight / 2))
                        el.scrollTop = scrollTop
                      }
                    }}
                  >
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
      {isOpen && usePortal && createPortal(
        (
          <div
            className={`fixed flex flex-col bg-white dark:bg-gray-800 sm:rounded-xl sm:shadow-2xl border border-slate-200 dark:border-gray-700`}
            style={{ top: portalCoords.top, left: portalCoords.left, width: portalCoords.width, maxWidth: 360, zIndex: portalZ }}
            ref={portalContainerRef}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-base"
              >
                ←
              </button>
              <div className="flex-1 flex items-center justify-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    className="text-base font-semibold text-slate-900 dark:text-mm-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      setIsMonthDropdownOpen(!isMonthDropdownOpen)
                      setIsYearDropdownOpen(false)
                    }}
                  >
                    {currentDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { month: 'long' })}
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {isMonthDropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-36 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto"
                      ref={(el) => {
                        if (el) {
                          const activeIndex = currentDate.getMonth()
                          const itemHeight = 40
                          const containerHeight = 192
                          const scrollTop = Math.max(0, (activeIndex * itemHeight) - (containerHeight / 2) + (itemHeight / 2))
                          el.scrollTop = scrollTop
                        }
                      }}
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
                <div className="relative">
                  <button
                    type="button"
                    className="text-base font-semibold text-slate-900 dark:text-mm-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      setIsYearDropdownOpen(!isYearDropdownOpen)
                      setIsMonthDropdownOpen(false)
                    }}
                  >
                    {currentDate.getFullYear()}
                    <span className="ml-1 text-sm">▼</span>
                  </button>
                  {isYearDropdownOpen && (
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-24 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg shadow-lg z-[10000] max-h-48 overflow-y-auto"
                      ref={(el) => {
                        if (el) {
                          const activeIndex = 10
                          const itemHeight = 40
                          const containerHeight = 192
                          const scrollTop = Math.max(0, (activeIndex * itemHeight) - (containerHeight / 2) + (itemHeight / 2))
                          el.scrollTop = scrollTop
                        }
                      }}
                    >
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
                className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-base"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-base ml-2 sm:hidden"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-4 py-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {getDayNames().map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-slate-600 dark:text-mm-subtleText py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((date, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => selectDate(date)}
                    className={`
                      p-2 text-xs rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-gray-700 min-h-[36px] aspect-square font-medium
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
            <div className="flex justify-between gap-2 p-3 border-t border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null)
                  onChange('')
                  setIsOpen(false)
                }}
                className="px-3 py-2 bg-white dark:bg-gray-700 text-slate-700 dark:text-mm-text hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors rounded-lg font-medium border border-slate-200 dark:border-gray-600 text-xs"
              >
                {t('common.clear')}
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg font-medium shadow-lg text-xs"
              >
                {t('common.today')}
              </button>
            </div>
          </div>
        ), document.body)
      }
    </div>
  )
}

export default DatePicker
