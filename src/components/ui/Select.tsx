import React, { useState, useRef, useEffect, forwardRef } from 'react'

type Option = {
  value: string | number
  label: string
}

type SelectProps = {
  id: string
  label?: string
  value: string | number | (string | number)[]  // Multi-select için array desteği
  onChange: (value: string | number | (string | number)[]) => void
  options: Option[]
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  dropdownDirection?: 'down' | 'up'
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  isMulti?: boolean  // Multi-select için
  closeMenuOnSelect?: boolean  // Multi-select için
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(({ 
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Seçiniz',
  error,
  className = '',
  required = false,
  disabled = false,
  searchable = true,
  dropdownDirection = 'down',
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  isMulti = false,
  closeMenuOnSelect = true,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionRefs = useRef<HTMLDivElement[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const [autoDirection, setAutoDirection] = useState<'down' | 'up'>(dropdownDirection)

  // Forwarded ref ile iç ref'i birleştir
  const setCombinedRef = (node: HTMLDivElement | null) => {
    // İç ref
    ;(selectRef as any).current = node
    // Dış ref (forwarded)
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref && 'current' in (ref as any)) {
      ;(ref as any).current = node
    }
  }

  const selectedOption = isMulti && Array.isArray(value) 
    ? options.filter(option => value.includes(option.value))
    : options.find(option => option.value === value)
  
  // Scroll event handler for infinity scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore()
    }
  }
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const root = selectRef.current
      if (root && !root.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Menü açıldığında seçili değeri vurgula ve görünür alana/merkeze getir
  useEffect(() => {
    if (isOpen) {
      const index = options.findIndex((o) => o.value === value)
      setHighlightedIndex(index)
      // Bir sonraki frame'de scrollIntoView çağır
      requestAnimationFrame(() => {
        const container = listRef.current
        const el = optionRefs.current[index]
        if (container && el && index >= 0) {
          const containerHeight = container.clientHeight
          const optionTop = el.offsetTop // container içinde konum
          const optionHeight = el.offsetHeight
          // Seçili öğeyi konteynerin ortasına hizala
          const targetScrollTop = Math.max(0, optionTop - (containerHeight / 2 - optionHeight / 2))
          container.scrollTop = targetScrollTop
        }
      })
    }
  }, [isOpen, options, value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSelect = (selectedValue: string | number | null) => {
    if (isMulti && Array.isArray(value)) {
      // Multi-select: değeri ekle veya çıkar
      const newValue = value.includes(selectedValue)
        ? value.filter(v => v !== selectedValue)
        : [...value, selectedValue]
      onChange(newValue)
      
      // closeMenuOnSelect false ise menüyü açık tut
      if (closeMenuOnSelect) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    } else {
      // Single select: değeri değiştir ve menüyü kapat
      onChange(selectedValue)
      setIsOpen(false)
      setSearchTerm('')
      setHighlightedIndex(-1)
    }
  }

  const handleToggle = () => {
    if (!disabled) {
      const willOpen = !isOpen
      setIsOpen(willOpen)
      if (!isOpen && selectRef.current) {
        const rect = selectRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        const estimatedMenuHeight = 320 // px
        const shouldOpenUp = spaceBelow < Math.min(estimatedMenuHeight, viewportHeight * 0.4) && spaceAbove > spaceBelow
        setAutoDirection(shouldOpenUp ? 'up' : 'down')
      }
      if (!isOpen) {
        setSearchTerm('')
        // Açıldığında highlight açılış effect'inde ayarlanacak
      }
    }
  }

  const baseClasses = 'w-full px-4 py-2 rounded-xl transition-all duration-300 bg-white dark:bg-gray-800 text-slate-900 dark:text-mm-text border-2 outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary h-12'
  const borderClasses = error 
    ? 'border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' 
    : 'border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-gray-700' : 'cursor-pointer'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={setCombinedRef}>
        <div
          className={`${baseClasses} ${borderClasses} ${disabledClasses} flex items-center justify-between`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${id}-label` : undefined}
        >
          <span className={`${!selectedOption ? 'text-slate-400 dark:text-mm-placeholder' : ''}`}>
            {selectedOption ? (
              isMulti && Array.isArray(selectedOption) ? (
                <div className="flex flex-wrap gap-1">
                  {selectedOption.map((option, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-md">
                      {option.label}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const newValue = (value as (string | number)[]).filter(v => v !== option.value)
                          onChange(newValue)
                        }}
                        className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800/40 rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                (selectedOption as Option).label
              )
            ) : (
              placeholder
            )}
          </span>
          <svg 
            className={`w-5 h-5 text-slate-400 dark:text-mm-placeholder transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className={`absolute z-[100] w-full bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-600 rounded-xl shadow-lg max-h-80 overflow-hidden ${
            (autoDirection || dropdownDirection) === 'up' 
              ? 'bottom-full mb-1' 
              : 'top-full mt-1'
          }`}>
            {searchable && (
              <div className="p-2 border-b border-slate-100 dark:border-gray-600">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ara..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-mm-text placeholder-slate-400 dark:placeholder-mm-placeholder focus:outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary"
                />
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto custom-scrollbar" ref={listRef} onScroll={handleScroll}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-mm-subtleText text-center">
                  Sonuç bulunamadı
                </div>
              ) : (
                <>
                  {filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      ref={(el) => {
                        if (el) optionRefs.current[index] = el
                      }}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                        index === highlightedIndex
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-900 dark:text-mm-text'
                      }`}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option.label}
                    </div>
                  ))}
                  
                  {/* Loading indicator for infinity scroll */}
                  {hasMore && (
                    <div className="px-4 py-3 text-sm text-slate-500 dark:text-mm-subtleText text-center border-t border-slate-100 dark:border-gray-600">
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                          <span>Yükleniyor...</span>
                        </div>
                      ) : (
                        <span>Daha fazla yüklemek için aşağı kaydırın</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-400 dark:text-red-300">{error}</p>
      )}
    </div>
  )
})

export default Select
