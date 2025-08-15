import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getPreferredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
    // Varsayılan: Light (sistem tercihinden bağımsız)
    return 'light'
  }

  const [theme, setThemeState] = useState<Theme>(getPreferredTheme())

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }

  useEffect(() => {
    applyTheme(theme)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
