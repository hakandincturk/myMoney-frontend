import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  message, 
  type, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      // Progress bar animasyonu
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval)
            return 0
          }
          return prev - (100 / (duration / 100))
        })
      }, 100)

      // Toast'u otomatik kapat
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onClose(id)
        }, 300) // Animasyon süresi
      }, duration)

      return () => {
        clearTimeout(timer)
        clearInterval(progressInterval)
      }
    }
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600'
      case 'error':
        return 'bg-red-500 text-white border-red-600'
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600'
      case 'info':
        return 'bg-blue-500 text-white border-blue-600'
      default:
        return 'bg-gray-500 text-white border-gray-600'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '💬'
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      style={{
        animation: isVisible ? 'slideInFromRight 0.3s ease-out' : 'none'
      }}
    >
      <div className={`
        flex flex-col rounded-lg shadow-2xl border-2 overflow-hidden 
        ${getToastStyles()} 
        min-w-[350px] max-w-[450px]
      `}>
        {/* Toast Content */}
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-lg flex-shrink-0">{getIcon()}</span>
          <span className="flex-1 text-sm font-medium break-words">{message}</span>
          <Button
            onClick={handleClose}
            variant="secondary"
            className="text-white/80 hover:text-white text-lg font-bold transition-colors duration-200 hover:scale-110 flex-shrink-0 bg-transparent border-none hover:bg-transparent p-0 min-w-0 h-auto"
            aria-label="Toast'u kapat"
          >
            ×
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-black/20">
          <div
            className="h-full bg-white/80 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
