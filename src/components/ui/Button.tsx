import React from 'react'

type ButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
  onClick?: () => void
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  onClick,
  fullWidth = false,
}) => {
  const base = 'relative inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden group'

  const variants: Record<'primary' | 'secondary', string> = {
    primary:
      'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-mm-accent dark:via-mm-accentHover dark:to-mm-accent text-white dark:text-mm-bg hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 dark:hover:from-mm-accentHover dark:hover:via-mm-accent dark:hover:to-mm-accentHover focus:ring-slate-900/50 dark:focus:ring-mm-accent/50 disabled:from-slate-400 disabled:via-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed shadow-lg shadow-slate-900/25 dark:shadow-mm-accent/25 hover:shadow-xl hover:shadow-slate-900/30 dark:hover:shadow-mm-accent/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-700',
    secondary:
      'border-2 border-slate-300 dark:border-mm-primary bg-white/80 dark:bg-mm-surface/80 backdrop-blur-sm text-slate-700 dark:text-mm-primary hover:border-slate-400 dark:hover:border-mm-primaryHover hover:bg-white dark:hover:bg-mm-surface focus:ring-slate-300 dark:focus:ring-mm-primary/50 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300',
  }

  const size = 'px-4 py-3 text-sm'
  const width = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${size} ${width} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
