import React from 'react'
import { Toast, ToastType } from './Toast'
import { ToastItem } from '../../hooks/useToast'

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemoveToast: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  const handleClose = (id: string) => {
    onRemoveToast(id)
  }

  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      {toasts.map((toast, index) => {
        // Her toast'u farklı pozisyonda göster
        const topPosition = 16 + (index * 80) // 16px + (index * 80px)
        
        return (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{ 
              position: 'absolute', 
              top: `${topPosition}px`, 
              right: '16px' 
            }}
          >
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={handleClose}
            />
          </div>
        )
      })}
    </div>
  )
}
