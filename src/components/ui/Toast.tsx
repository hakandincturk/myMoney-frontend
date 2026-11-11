import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
  faXmark,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  type: ToastType
  duration?: number
  count?: number
  version?: number
  onClose: (id: string) => void
}

const DEFAULT_DURATION = 5000
const EXIT_ANIMATION_MS = 200

// Solid pastel surfaces, no borders or glow; each type keeps readable contrast in both themes
const TYPE_STYLES: Record<ToastType, { surface: string; icon: string; progress: string; glyph: IconDefinition }> = {
  success: {
    surface: 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
    icon: 'text-emerald-600 dark:text-emerald-300',
    progress: 'bg-emerald-500/60 dark:bg-emerald-300/60',
    glyph: faCircleCheck,
  },
  error: {
    surface: 'bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100',
    icon: 'text-rose-600 dark:text-rose-300',
    progress: 'bg-rose-500/60 dark:bg-rose-300/60',
    glyph: faCircleXmark,
  },
  warning: {
    surface: 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-300',
    progress: 'bg-amber-500/60 dark:bg-amber-300/60',
    glyph: faTriangleExclamation,
  },
  info: {
    surface: 'bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
    icon: 'text-sky-600 dark:text-sky-300',
    progress: 'bg-sky-500/60 dark:bg-sky-300/60',
    glyph: faCircleInfo,
  },
}

/**
 * A single toast. Auto-dismisses after `duration` ms (0 keeps it until closed); hovering or focusing
 * it pauses the timer so a long message can be read. `version` changes restart the timer.
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = DEFAULT_DURATION,
  count = 1,
  version = 0,
  onClose,
}) => {
  const { t } = useTranslation()
  const [isLeaving, setIsLeaving] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const remainingRef = useRef(duration)
  const startedAtRef = useRef(0)
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.info

  const dismiss = useCallback(() => {
    setIsLeaving(true)
    window.setTimeout(() => onClose(id), EXIT_ANIMATION_MS)
  }, [id, onClose])

  // A re-shown toast gets its full time back
  useEffect(() => {
    remainingRef.current = duration
  }, [version, duration])

  useEffect(() => {
    if (duration <= 0 || isPaused || isLeaving) return
    startedAtRef.current = Date.now()
    const timer = window.setTimeout(dismiss, remainingRef.current)
    return () => {
      window.clearTimeout(timer)
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current))
    }
  }, [duration, isPaused, isLeaving, version, dismiss])

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`${isLeaving ? 'toast-exit' : 'toast-enter'} overflow-hidden rounded-xl shadow-lg ${style.surface}`}
    >
      <div className="flex items-start gap-3 py-3 pl-4 pr-2">
        <FontAwesomeIcon icon={style.glyph} className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.icon}`} />
        {/* Long server messages (e.g. dev debug info) scroll inside the toast instead of growing it */}
        <p className="max-h-24 sm:max-h-40 min-w-0 flex-1 overflow-y-auto whitespace-pre-line break-words text-sm font-medium leading-5">
          {message}
        </p>
        {count > 1 && (
          <span className="mt-0.5 flex-shrink-0 rounded-full bg-black/10 px-2 text-xs font-semibold leading-5 dark:bg-white/15">
            ×{count}
          </span>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('buttons.close')}
          className="-my-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg opacity-70 transition hover:bg-black/10 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
        >
          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
        </button>
      </div>

      {duration > 0 && (
        <div className="h-1 w-full bg-black/5 dark:bg-white/10">
          <div
            key={version}
            className={`toast-progress h-full ${style.progress}`}
            style={{ animationDuration: `${duration}ms`, animationPlayState: isPaused || isLeaving ? 'paused' : 'running' }}
          />
        </div>
      )}
    </div>
  )
}
