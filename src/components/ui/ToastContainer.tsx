import React from 'react'
import { Toast } from './Toast'
import { ToastItem } from '../../hooks/useToast'

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemoveToast: (id: string) => void
}

/**
 * Full-width strip on phones, a fixed-width column on the top right from `sm` up.
 * Sits above modals (overlay 9999 / panel 10000) and dropdown portals (10050), otherwise a modal
 * overlay covers the toasts and a click on their close button lands on the overlay instead.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[11000] flex flex-col gap-2 p-3 sm:inset-x-auto sm:right-0 sm:w-96 sm:p-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            count={toast.count}
            version={toast.version}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  )
}
