import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faMobileScreen, faTabletScreenButton } from '@fortawesome/free-solid-svg-icons'
import type { AuthDTOs } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useRevokeOtherSessionsMutation, useRevokeSessionMutation, useSessionsQuery } from '@/services/authApi'

type SessionsPanelProps = {
  /** Logs this browser out (same as the sidebar button); used for the current session's row. */
  onLogoutCurrent: () => void
}

const showToast = (message: string, type: 'success' | 'error') =>
  window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type, duration: 4000 } }))

const deviceIcon = (label: string) => {
  if (label.includes('iPhone') || label.includes('Android')) return faMobileScreen
  if (label.includes('iPad')) return faTabletScreenButton
  return faDesktop
}

/** "3 dk önce" style text; falls back to the absolute date after a week. */
const useRelativeTime = () => {
  const { i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'tr'
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  return (iso: string) => {
    const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
    const abs = Math.abs(diffSec)
    if (abs < 60) return rtf.format(0, 'minute')
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
    if (abs < 7 * 86400) return rtf.format(Math.round(diffSec / 86400), 'day')
    return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
}

export const SessionsPanel: React.FC<SessionsPanelProps> = ({ onLogoutCurrent }) => {
  const { t } = useTranslation()
  const relative = useRelativeTime()
  const { data, isLoading, isError, refetch } = useSessionsQuery()
  const [revokeSession, { isLoading: revoking }] = useRevokeSessionMutation()
  const [revokeOthers, { isLoading: revokingOthers }] = useRevokeOtherSessionsMutation()
  const [pending, setPending] = useState<AuthDTOs.Session | 'others' | null>(null)

  // This device first, the rest as the server sends them (most recently active first)
  const sessions = [...(data?.data ?? [])].sort((a, b) => Number(b.current) - Number(a.current))
  const hasOthers = sessions.some((s) => !s.current)

  const confirm = async () => {
    if (!pending) return
    try {
      if (pending === 'others') {
        const res = await revokeOthers().unwrap()
        showToast(t('accountSettings.sessions.othersRevoked', { count: res.data?.revokedCount ?? 0 }), 'success')
      } else if (pending.current) {
        setPending(null)
        onLogoutCurrent()
        return
      } else {
        await revokeSession(pending.id).unwrap()
        showToast(t('accountSettings.sessions.revoked'), 'success')
      }
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message || t('accountSettings.sessions.revokeFailed')
      showToast(message, 'error')
    }
    setPending(null)
  }

  const confirmBody = () => {
    if (pending === null) return ''
    if (pending === 'others') return t('accountSettings.sessions.confirmOthersBody')
    if (pending.current) return t('accountSettings.sessions.confirmCurrentBody')
    return t('accountSettings.sessions.confirmBody', { device: pending.deviceLabel })
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-mm-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-mm-text">{t('accountSettings.sessions.title')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('accountSettings.sessions.subtitle')}</p>
        </div>
        {hasOthers && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => setPending('others')}
            disabled={revokingOthers}
          >
            {t('accountSettings.sessions.revokeOthers')}
          </Button>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-2 py-4 text-sm text-slate-600 dark:text-slate-300">
            <span>{t('accountSettings.sessions.loadFailed')}</span>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>{t('common.retry')}</Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.current ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-mm-bg dark:text-slate-400'}`}>
                    <FontAwesomeIcon icon={deviceIcon(s.deviceLabel)} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-mm-text">{s.deviceLabel}</span>
                      {s.current && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {t('accountSettings.sessions.thisDevice')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {[
                        t('accountSettings.sessions.lastActive', { time: relative(s.lastSeenAt) }),
                        s.ipAddress,
                        s.country,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setPending(s)}
                  disabled={revoking}
                >
                  {t('accountSettings.sessions.logout')}
                </Button>
              </li>
            ))}
            {!hasOthers && sessions.length > 0 && (
              <li className="py-4 text-sm text-slate-500 dark:text-slate-400">{t('accountSettings.sessions.noOthers')}</li>
            )}
          </ul>
        )}
      </div>

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title={pending === 'others' ? t('accountSettings.sessions.confirmOthersTitle') : t('accountSettings.sessions.confirmTitle')}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPending(null)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={confirm} disabled={revoking || revokingOthers}>
              {pending === 'others' ? t('accountSettings.sessions.revokeOthers') : t('accountSettings.sessions.logout')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{confirmBody()}</p>
      </Modal>
    </section>
  )
}
