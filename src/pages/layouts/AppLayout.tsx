import React from 'react'
import { Header } from '@/components/ui/Header'
import { useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

type AppLayoutProps = {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  return (
    <div className="min-h-full bg-white text-slate-900 dark:bg-mm-bg dark:text-mm-text">
      <Header />
      {isAuth && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      <main className={`${isAuth ? 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0f0f0f] dark:to-[#151515]' : 'max-w-6xl mx-auto px-4 py-6'}`}>
        {children}
      </main>
    </div>
  )
}


