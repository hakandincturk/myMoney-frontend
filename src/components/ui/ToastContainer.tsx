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
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none p-4 flex flex-col items-end gap-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={handleClose}
          />
        </div>
      ))}
    </div>
  )
}
