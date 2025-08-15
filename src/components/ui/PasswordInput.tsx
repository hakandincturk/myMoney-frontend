import React, { useState } from 'react'

type PasswordInputProps = {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ id, label = 'Şifre', value, onChange, placeholder = 'Şifrenizi girin', error }) => {
  const [visible, setVisible] = useState(false)

  const base = 'w-full px-4 py-3 rounded-xl transition-all duration-200 placeholder-slate-400 dark:placeholder-mm-placeholder bg-white text-slate-900 dark:bg-mm-surface dark:text-mm-text focus:ring-2 focus:ring-mm-primary focus:border-transparent outline-none pr-12'
  const border = error ? 'border border-red-500' : 'border border-slate-200 dark:border-mm-border'

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
          {label}
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
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-mm-placeholder hover:text-slate-700 dark:hover:text-mm-text"
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


