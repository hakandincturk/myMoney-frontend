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
            className={`fixed inset-y-0 left-0 z-40 transform bg-slate-50 dark:bg-mm-card border-r border-slate-200 dark:border-mm-border transition-all duration-300 ease-in-out shadow-lg ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: `${sidebarWidth}px` }}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-lg bg-mm-primary/20 dark:bg-mm-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-mm-primary dark:text-mm-primary font-bold text-lg">₺</span>
                </div>
                <span className="font-semibold text-lg text-slate-900 dark:text-mm-text group-hover:text-mm-primary transition-colors duration-200">MyMoney</span>
              </Link>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleSidebar} 
                  className="p-2 rounded hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-all duration-200 hover:scale-110" 
                  aria-label="Sidebar'ı kapat"
                  title="Sidebar'ı kapat"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-lg" />
                </button>
              </div>
            </div>
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
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md' 
                      : 'text-slate-700 dark:text-mm-text hover:bg-blue-50 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => {
                    // Sadece mobilde sidebar'ı kapat
                    if (isMobile) {
                      hideSidebar()
                    }
                  }}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-20px)',
                    opacity: sidebarOpen ? 1 : 0.8
                  }}
                >
                  <FontAwesomeIcon icon={i.icon} className="text-lg" />
                  {i.label}
                </NavLink>
              ))}
            </nav>
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
            
            {/* Sidebar genişlik ayarlayıcı */}
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
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-in fade-in duration-200"
              onClick={hideSidebar}
            />
          )}

          {/* Content wrapper */}
          <div 
            className={`flex-1 transition-all duration-300 ease-in-out w-full`}
            style={{ 
              marginLeft: !isMobile && sidebarOpen ? `${sidebarWidth}px` : '0px' 
            }}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-mm-border bg-slate-50 dark:bg-mm-card z-20">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleSidebar} 
                  className={`p-2 rounded transition-all duration-200 hover:scale-110 ${
                    sidebarOpen 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : 'hover:bg-slate-100 dark:hover:bg-mm-cardHover text-slate-700 dark:text-mm-text'
                  }`}
                  aria-label="Sidebar'ı aç/kapat"
                  title={`Sidebar'ı ${sidebarOpen ? 'kapat' : 'aç'} (Ctrl+B)`}
                >
                  <FontAwesomeIcon icon={faBars} className="text-lg" />
                </button>
                {!sidebarOpen && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                      Sidebar kapalı
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:block">
                      Ctrl+B ile aç
                    </span>
                  </div>
                )}
              </div>
              {/* <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                <Button onClick={logout} variant="secondary" className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600 hover:!border-red-700 dark:!bg-red-600 dark:hover:!bg-red-700 dark:!text-white dark:!border-red-600 dark:hover:!border-red-700 transition-all duration-200 hover:scale-105">
                  {t('navigation.logout')}
                </Button>
              </div> */}
            </div>
            <main className="w-full">{children}</main>
          </div>
        </div>
      )}
    </div>
  )
}


