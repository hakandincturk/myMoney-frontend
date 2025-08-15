import React from 'react'

type InputProps = {
  id: string
  label?: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
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
}) => {
  const base = 'w-full px-4 py-3 rounded-xl transition-all duration-200 placeholder-slate-400 dark:placeholder-mm-placeholder bg-white text-slate-900 dark:bg-mm-surface dark:text-mm-text focus:ring-2 focus:ring-mm-primary focus:border-transparent outline-none'
  const border = error ? 'border border-red-500' : 'border border-slate-200 dark:border-mm-border'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`${base} ${border}`}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default Input
