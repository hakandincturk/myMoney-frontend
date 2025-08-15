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
  const base = 'w-full px-4 py-3 rounded-xl transition-all duration-300 placeholder-slate-400 dark:placeholder-mm-placeholder bg-white/90 dark:bg-mm-surface/90 backdrop-blur-sm text-slate-900 dark:text-mm-text focus:ring-2 focus:ring-slate-500/50 dark:focus:ring-mm-primary/50 focus:border-transparent outline-none hover:bg-white dark:hover:bg-mm-surface focus:shadow-lg'
  const border = error ? 'border-2 border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' : 'border border-slate-200/60 dark:border-mm-border/60 focus:border-slate-400 dark:focus:border-mm-primary'

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
