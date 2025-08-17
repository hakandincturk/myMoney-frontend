import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/pages/layouts/AppLayout'
import { AppRoutes } from '@/pages/routes/AppRoutes'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '../hooks/useToast'

const App: React.FC = () => {
  const navigate = useNavigate()
  const { toasts, showToast, removeToast, clearAllToasts } = useToast()

  useEffect(() => {
    // Global toast event listener'ı ekle
    const handleShowToast = (event: CustomEvent) => {
      const { message, type, duration } = event.detail
      showToast(message, type, duration)
    }

    const handleNavigateToLogin = () => {
      clearAllToasts()
      navigate('/login')
    }

    window.addEventListener('showToast', handleShowToast as EventListener)
    window.addEventListener('navigateToLogin', handleNavigateToLogin)

    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener)
      window.removeEventListener('navigateToLogin', handleNavigateToLogin)
    }
  }, [navigate, showToast, clearAllToasts])

  return (
    <>
      <AppLayout>
        <AppRoutes />
      </AppLayout>
      
      <ToastContainer 
        toasts={toasts} 
        onRemoveToast={removeToast} 
      />
    </>
  )
}

export default App


