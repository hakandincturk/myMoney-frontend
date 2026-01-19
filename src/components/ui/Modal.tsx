import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  zIndex?: number
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = 'md', zIndex = 10000 }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleEsc)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open || !mounted) return null

  // Portal kullanarak body'ye direkt mount et
  return createPortal(
    <>
      {/* Backdrop - Tüm ekranı kaplar ve sidebar/header dahil karartır */}
      <div 
        className="fixed inset-0" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: zIndex - 1
        }}
        onClick={onClose}
      />
      
      {/* Modal Content - Backdrop'un üzerinde görünür */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none" style={{ zIndex }}>
        <div className={`relative w-full bg-white dark:bg-mm-card shadow-2xl pointer-events-auto rounded-xl border border-slate-200 dark:border-mm-border max-h-[90vh] flex flex-col ${
          size === 'sm' ? 'max-w-sm' :
          size === 'md' ? 'max-w-md' :
          size === 'lg' ? 'max-w-lg' :
          size === 'xl' ? 'max-w-4xl' : 'max-w-md'
        }`}>
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-slate-100 dark:border-mm-border">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-mm-text">
                {title}
              </h3>
            </div>
          )}
          
          {/* Body - İçerik taşarsa modal içinde scroll */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0 modal-scrollbar">
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


