import React from 'react'

type CheckboxProps = {
  id?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: React.ReactNode
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked = false, onChange, disabled = false, className = '', label }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />

      <span className={`w-5 h-5 inline-block rounded-md flex items-center justify-center border transition-colors ${checked ? 'bg-mm-primary border-mm-primary text-white' : 'bg-white border-slate-300 dark:bg-gray-800 dark:border-gray-600'}`}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && (
        <span className="ml-2 text-sm text-slate-700 dark:text-mm-text">{label}</span>
      )}
    </label>
  )
}

export default Checkbox
