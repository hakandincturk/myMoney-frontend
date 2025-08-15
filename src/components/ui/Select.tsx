import React, { useState, useRef, useEffect } from 'react'

type Option = {
  value: string | number
  label: string
}

type SelectProps = {
  id: string
  label?: string
  value: string | number
  onChange: (value: string | number) => void
  options: Option[]
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
}

export const Select: React.FC<SelectProps> = ({
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
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(option => option.value === value)
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  const handleSelect = (selectedValue: string | number) => {
    onChange(selectedValue)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }
  }

  const baseClasses = 'w-full px-4 py-3 rounded-xl transition-all duration-300 bg-white dark:bg-mm-card text-slate-900 dark:text-mm-text border-2 outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary'
  const borderClasses = error 
    ? 'border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' 
    : 'border-slate-200 dark:border-mm-border hover:border-slate-300 dark:hover:border-mm-border/80'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-mm-disabled' : 'cursor-pointer'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
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
            {selectedOption ? selectedOption.label : placeholder}
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
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-mm-card border-2 border-slate-200 dark:border-mm-border rounded-xl shadow-lg max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-slate-100 dark:border-mm-border">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ara..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-mm-bg border border-slate-200 dark:border-mm-border rounded-lg text-slate-900 dark:text-mm-text placeholder-slate-400 dark:placeholder-mm-placeholder focus:outline-none focus:ring-2 focus:ring-mm-primary/50 focus:border-mm-primary"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 dark:text-mm-subtleText text-center">
                  Sonuç bulunamadı
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                      index === highlightedIndex
                        ? 'bg-mm-primary/10 dark:bg-mm-primary/20 text-mm-primary dark:text-mm-primary'
                        : 'hover:bg-slate-50 dark:hover:bg-mm-cardHover text-slate-900 dark:text-mm-text'
                    }`}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.label}
                  </div>
                ))
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
}

export default Select
