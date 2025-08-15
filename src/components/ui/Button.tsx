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
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2'

  const variants: Record<'primary' | 'secondary', string> = {
    primary:
      'bg-mm-accent text-mm-bg hover:bg-mm-accentHover focus:ring-mm-primary disabled:bg-mm-disabled disabled:text-mm-placeholder disabled:cursor-not-allowed',
    secondary:
      'border border-mm-primary text-mm-primary hover:border-mm-primaryHover hover:bg-slate-50 dark:hover:bg-[#151515] focus:ring-mm-primary disabled:border-mm-disabled disabled:text-mm-placeholder disabled:cursor-not-allowed',
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
