import React from 'react'
import { Button } from '@/components/ui/Button'
import { useTheme } from './ThemeProvider'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button
      type="button"
      onClick={toggleTheme}
      variant="secondary"
      aria-label="Tema değiştir"
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        isDark
          ? 'border border-mm-border bg-mm-surface text-mm-text hover:bg-[#151515]'
          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      } ${className}`}
    >
      {isDark ? (
        <>
          <span className="i">🌙</span>
          <span>Koyu</span>
        </>
      ) : (
        <>
          <span className="i">☀️</span>
          <span>Açık</span>
        </>
      )}
    </Button>
  )
}

export default ThemeToggle
