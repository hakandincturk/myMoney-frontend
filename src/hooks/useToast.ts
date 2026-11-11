import { useState, useCallback } from 'react'
import { ToastType } from '@/components/ui/Toast'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration?: number
  // How many times the same message was shown while this toast was on screen
  count: number
  // Changes whenever the toast is re-shown, so its timer and progress bar restart
  version: number
}

// More than this would cover the screen on phones; the oldest toast makes room for the newest
export const MAX_VISIBLE_TOASTS = 3

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    setToasts(prev => {
      // A repeated message (e.g. the same error on every retry) bumps the existing toast instead of stacking
      const duplicate = prev.find(toast => toast.message === message && toast.type === type)
      if (duplicate) {
        return prev.map(toast => toast.id === duplicate.id
          ? { ...toast, count: toast.count + 1, version: toast.version + 1, duration }
          : toast)
      }

      const newToast: ToastItem = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
        message,
        type,
        duration,
        count: 1,
        version: 0,
      }

      return [...prev, newToast].slice(-MAX_VISIBLE_TOASTS)
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  }
}
