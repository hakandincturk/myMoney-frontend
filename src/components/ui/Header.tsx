import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const Header: React.FC = () => {
  const location = useLocation()
  const hideOnAuth = location.pathname === '/login' || location.pathname === '/register'
  if (hideOnAuth) {
    return null
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive ? 'text-mm-primary' : 'text-slate-700 dark:text-mm-text'
    } hover:text-mm-primaryHover`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-mm-border bg-white/80 dark:bg-mm-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-mm-primary/20 flex items-center justify-center">
            <span className="text-mm-primary font-bold">₺</span>
          </div>
          <span className="text-slate-900 dark:text-mm-text font-semibold">MyMoney</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass} end>
            Ana Sayfa
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Giriş
          </NavLink>
          <NavLink to="/register" className={navLinkClass}>
            Kayıt
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

export default Header


