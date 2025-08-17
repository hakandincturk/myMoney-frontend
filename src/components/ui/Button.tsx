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
      'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-blue-600/50 dark:focus:ring-blue-700/50 disabled:bg-gray-400 disabled:cursor-not-allowed',
    secondary:
      'border-2 border-blue-600 dark:border-blue-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 focus:ring-blue-600/50 dark:focus:ring-blue-500/50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed',
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
