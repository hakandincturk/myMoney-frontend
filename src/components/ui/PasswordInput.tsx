import React, { useState } from 'react'

type PasswordInputProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ id, label = 'Şifre', value, onChange, placeholder = 'Şifrenizi girin', error, required = false }) => {
  const [visible, setVisible] = useState(false)

  const base = 'w-full px-4 py-3 rounded-xl transition-all duration-300 placeholder-slate-400 dark:placeholder-mm-placeholder bg-white/90 dark:bg-mm-surface/90 backdrop-blur-sm text-slate-900 dark:text-mm-text focus:ring-2 focus:ring-slate-500/50 dark:focus:ring-mm-primary/50 focus:border-transparent outline-none pr-12 hover:bg-white dark:hover:bg-mm-surface focus:shadow-lg border-2'
  const border = error ? 'border-red-500 shadow-lg shadow-red-100 dark:shadow-red-900/20' : 'border-slate-200/60 dark:border-mm-border/60 focus:border-slate-400 dark:focus:border-mm-primary'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`${base} ${border}`}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-mm-placeholder hover:text-slate-700 dark:hover:text-mm-primary transition-colors duration-200"
          onClick={() => setVisible(!visible)}
        >
          {visible ? 'Gizle' : 'Göster'}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default PasswordInput


