import React from 'react'
import { Button } from '@/components/ui/Button'
import { useTheme } from './ThemeProvider'

type Props = { className?: string; size?: 'default' | 'compact' }

export const ThemeToggle: React.FC<Props> = ({ className = '', size = 'default' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button
      type="button"
      onClick={toggleTheme}
      variant="secondary"
      aria-label="Tema değiştir"
      className={`inline-flex items-center gap-2 rounded-lg ${size === 'compact' ? 'h-10 w-10 p-0 text-base justify-center' : 'px-3 py-2 text-sm'} transition-colors ${
        isDark
          ? 'border border-mm-border bg-mm-surface text-mm-text hover:bg-[#151515]'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      } ${className}`}
    >
      {isDark ? (
        size === 'compact' ? (
          <span className="i" aria-hidden>🌙</span>
        ) : (
          <>
            <span className="i">🌙</span>
            <span>Koyu</span>
          </>
        )
      ) : (
        size === 'compact' ? (
          <span className="i" aria-hidden>☀️</span>
        ) : (
          <>
            <span className="i">☀️</span>
            <span>Açık</span>
          </>
        )
      )}
    </Button>
  )
}

export default ThemeToggle
