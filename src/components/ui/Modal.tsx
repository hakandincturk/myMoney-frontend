import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!open || !mounted) return null

  // Portal kullanarak body'ye direkt mount et
  return createPortal(
    <>
      {/* Backdrop - Tüm ekranı kaplar ve sidebar/header dahil karartır */}
      <div 
        className="fixed inset-0 z-[9999]" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      />
      
      {/* Modal Content - Backdrop'un üzerinde görünür */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-lg bg-white dark:bg-mm-card shadow-2xl pointer-events-auto rounded-xl border border-slate-200 dark:border-mm-border">
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-slate-100 dark:border-mm-border">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-mm-text">
                {title}
              </h3>
            </div>
          )}
          
          {/* Body - Overflow kaldırıldı, dropdown'lar için yeterli alan */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-mm-border bg-slate-50 dark:bg-mm-bg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

export default Modal


