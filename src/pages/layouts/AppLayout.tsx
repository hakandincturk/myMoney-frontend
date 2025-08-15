import React, { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAppDispatch } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'

type AppLayoutProps = {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = () => {
    dispatch(authSlice.actions.logout())
    navigate('/login')
  }
  return (
    <div className="min-h-full text-slate-900 dark:text-mm-text">
      {isAuth ? (
        <>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <ThemeToggle />
          </div>
          <main className="w-full">{children}</main>
        </>
      ) : (
        <div className="min-h-screen w-full flex">
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-slate-50 dark:bg-mm-card border-r border-slate-200 dark:border-mm-border transition-transform duration-200 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card">
              <Link to="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-mm-primary/20 dark:bg-mm-primary/20 flex items-center justify-center">
                  <span className="text-mm-primary dark:text-mm-primary font-bold text-lg">₺</span>
                </div>
                <span className="font-semibold text-lg text-slate-900 dark:text-mm-text">MyMoney</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 rounded hover:bg-slate-100 dark:hover:bg-mm-cardHover" aria-label="Kapat">✕</button>
            </div>
            <nav className="p-4 space-y-2 bg-slate-50 dark:bg-mm-card">
              {[
                { to: '/', label: 'Ana Sayfa', end: true },
                { to: '/contacts', label: 'Kişiler' },
                { to: '/accounts', label: 'Hesaplar' },
                { to: '/debts/overview', label: 'Borçlar' },
                { to: '/installments', label: 'Taksitler' },
              ].map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end as boolean | undefined}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors duration-200 ease-in-out ${isActive ? 'bg-slate-100 dark:bg-mm-primary/10 text-mm-primary dark:text-mm-primary' : 'text-slate-700 dark:text-mm-text hover:bg-slate-100 dark:hover:bg-mm-cardHover'}`}
                >
                  {i.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-mm-border flex items-center justify-between bg-slate-50 dark:bg-mm-card">
              <ThemeToggle />
              <button onClick={logout} className="px-4 py-2 rounded-md bg-mm-danger dark:bg-mm-danger text-white hover:bg-mm-dangerHover dark:hover:bg-mm-dangerHover text-base font-medium">Çıkış</button>
            </div>
          </aside>

          {/* Content wrapper */}
          <div className="flex-1 md:ml-80 w-full">
            <div className="h-16 md:hidden flex items-center justify-between px-4 border-b border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card z-30">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-mm-cardHover" aria-label="Menü">☰</button>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={logout} className="px-4 py-2 rounded-md bg-mm-danger dark:bg-mm-danger text-white hover:bg-mm-dangerHover dark:hover:bg-mm-dangerHover text-base font-medium">Çıkış</button>
              </div>
            </div>
            <main className="w-full">{children}</main>
          </div>
        </div>
      )}
    </div>
  )
}


