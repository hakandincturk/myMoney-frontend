import React, { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faUsers, 
  faCreditCard, 
  faMoneyBillWave, 
  faCalendarAlt,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { Button } from '@/components/ui/Button'
import { useAppDispatch } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'
import { useTranslation } from 'react-i18next'

type AppLayoutProps = {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // localStorage'dan sidebar durumunu al, yoksa varsayılan olarak açık
    const saved = localStorage.getItem('sidebarOpen')
    return saved ? JSON.parse(saved) : true
  })
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    // localStorage'dan sidebar genişliğini al, yoksa varsayılan 320px
    const saved = localStorage.getItem('sidebarWidth')
    return saved ? parseInt(saved) : 320
  })
  const [isMobile, setIsMobile] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const collapsedWidth = 72

  // Sidebar durumunu localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  // Sidebar genişliğini localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('sidebarWidth', sidebarWidth.toString())
  }, [sidebarWidth])

  // Ekran boyutuna göre sidebar'ı otomatik kapat/aç
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      if (mobile) {
        setSidebarOpen(false)
      }
    }

    // İlk yüklemede kontrol et
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Keyboard shortcut ekle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // (Removed) desktop floating open button pulse state

  const logout = () => {
    dispatch(authSlice.actions.logout())
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Sidebar genişliğini ayarla
  const adjustSidebarWidth = (newWidth: number) => {
    setSidebarWidth(Math.max(280, Math.min(400, newWidth))) // 280px - 400px arası
  }

  // Sidebar'ı tamamen gizle (mobil için)
  const hideSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-full text-slate-900 dark:text-mm-text">
      {isAuth ? (
        <>
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <main className="w-full">{children}</main>
        </>
      ) : (
        <div className="min-h-screen w-full flex">
          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 transform bg-slate-50 dark:bg-mm-card border-r ${(!isMobile && !sidebarOpen) ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-mm-border'} transition-all duration-300 ease-in-out shadow-lg overflow-hidden ${
              isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
            }`}
            style={{ width: isMobile ? '85vw' : `${sidebarOpen ? sidebarWidth : collapsedWidth}px` }}
          >
            <div className={`h-16 flex items-center ${(!isMobile && !sidebarOpen) ? 'justify-center' : 'justify-between'} px-4 sm:px-6 border-b border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card`}>
              {/* Logo + title (condensed when collapsed on desktop) */}
              <Link to="/" className={`flex items-center ${!isMobile && !sidebarOpen ? '' : 'gap-3'} group`}>
                <div className="h-10 w-10 rounded-lg bg-mm-primary/20 dark:bg-mm-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-mm-primary dark:text-mm-primary font-bold text-lg">₺</span>
                </div>
                {(!isMobile && !sidebarOpen) ? null : (
                  <span className="font-semibold text-lg text-slate-900 dark:text-mm-text group-hover:text-mm-primary transition-colors duration-200">MyMoney</span>
                )}
              </Link>
              {/* Toggle button */}
              <div className={`flex items-center gap-2 ${!isMobile && !sidebarOpen ? 'hidden' : ''}`}>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-all duration-200 hover:scale-110"
                  aria-label={sidebarOpen ? "Sidebar'ı kapat" : "Sidebar'ı aç"}
                  title={sidebarOpen ? "Sidebar'ı kapat" : "Sidebar'ı aç"}
                >
                  <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="text-lg" />
                </button>
              </div>
              {/* In collapsed desktop, header centers the logo; toggle is rendered outside */}
            </div>
            {/* Collapsed state hint inside rail (desktop) */}
            {(!isMobile && !sidebarOpen) && (
              <div className="relative">
                {/* small hint badge at the top */}
                <div className="absolute top-4 right-0 w-px h-8 bg-blue-400/40" />
                <div className="pt-3 flex justify-center">
                  {/* Compact circular toggle to avoid overflow into content */}
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    title={t('navigation.menu')}
                    aria-label={t('navigation.menu')}
                    className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-sm hover:shadow-md hover:bg-blue-200 dark:hover:bg-blue-900/30 transition"
                  >
                    <FontAwesomeIcon icon={faBars} className="text-[13px]" />
                  </button>
                </div>
              </div>
            )}
            <nav className="p-4 pb-24 space-y-2 bg-slate-50 dark:bg-mm-card">
              {[
                { to: '/', label: t('sidebar.home'), icon: faHome, end: true },
                { to: '/contacts', label: t('sidebar.contacts'), icon: faUsers },
                { to: '/accounts', label: t('sidebar.accounts'), icon: faCreditCard },
                { to: '/debts/overview', label: t('sidebar.debts'), icon: faMoneyBillWave },
                { to: '/installments', label: t('sidebar.installments'), icon: faCalendarAlt },
              ].map((i, index) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  end={i.end as boolean | undefined}
                  className={({ isActive }) => `relative ${(!isMobile && !sidebarOpen) ? 'flex items-center justify-center h-12' : 'flex items-center gap-3 px-4 py-3'} rounded-lg text-base transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'text-slate-700 dark:text-mm-text hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => {
                    // Sadece mobilde sidebar'ı kapat
                    if (isMobile) {
                      hideSidebar()
                    }
                  }}
                  title={i.label}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-500" />
                      )}
                      <span className={`${(!isMobile && !sidebarOpen) ? 'h-10 w-10 flex items-center justify-center rounded-lg ' + (isActive ? 'bg-blue-900/30 text-blue-300' : 'bg-transparent') : ''}`}>
                        <FontAwesomeIcon icon={i.icon} className="text-lg" />
                      </span>
                      {(!isMobile && !sidebarOpen) ? null : (
                        <span>{i.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            {(!isMobile && !sidebarOpen) ? null : (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <LanguageToggle />
                    <ThemeToggle />
                  </div>
                  <Button
                    onClick={logout}
                    variant="secondary"
                    className="w-full !bg-red-600 hover:!bg-red-700 !text-white !border-red-600 hover:!border-red-700 dark:!bg-red-600 dark:hover:!bg-red-700 dark:!text-white dark:!border-red-600 dark:hover:!border-red-700 transition-all duration-200"
                  >
                    {t('navigation.logout')}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Sidebar genişlik ayarlayıcı */}
            {(!isMobile && sidebarOpen) && (
              <div
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 active:bg-blue-600 transition-colors group"
                onMouseDown={(e) => {
                  e.preventDefault()
                  const startX = e.clientX
                  const startWidth = sidebarWidth

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX
                    adjustSidebarWidth(startWidth + deltaX)
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Genişliği ayarlamak için sürükleyin"
              >
                <div className="absolute top-1/2 right-1 transform translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {sidebarWidth}px
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-in fade-in duration-200"
              onClick={hideSidebar}
            />
          )}

          {/* Mobile top bar (replaces floating button) */}
          {isMobile && !sidebarOpen && (
            <button
              type="button"
              onClick={toggleSidebar}
              title={t('navigation.menu')}
              aria-label={t('navigation.menu')}
              className="fixed z-40 h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-700 dark:text-mm-text bg-white/15 dark:bg-slate-900/25 backdrop-blur-md backdrop-saturate-150 hover:bg-white/25 dark:hover:bg-slate-900/35 ring-1 ring-white/30 dark:ring-white/10 shadow-sm transition-colors"
              style={{
                top: 'max(env(safe-area-inset-top), 0.75rem)',
                left: 'max(env(safe-area-inset-left), 0.75rem)'
              }}
            >
              <FontAwesomeIcon icon={faBars} className="text-[16px]" />
            </button>
          )}

          {/* Content wrapper */}
          <div 
            className={`flex-1 transition-all duration-300 ease-in-out w-full overflow-hidden flex flex-col`}
            style={{ 
              marginLeft: !isMobile ? (sidebarOpen ? `${sidebarWidth}px` : `${collapsedWidth}px`) : '0px'
            }}
          >
            {/* Content area uses full viewport on desktop; on mobile subtract top bar height */}
            <main
              className={`w-full custom-scrollbar overflow-y-auto flex flex-col ${isMobile ? 'h-screen' : 'h-screen'}`}
            >
              {children}
            </main>
          </div>
        </div>
      )}
    </div>
  )
}


