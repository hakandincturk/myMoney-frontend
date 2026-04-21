import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCalendarDays,
  faArrowRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import type { DashboardDTOs } from '@/types/dashboard'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY, formatShortDate, daysUntil } from './formatters'

type UpcomingListProps = {
  incoming?: DashboardDTOs.IncomingInstallments
  isLoading: boolean
  hasError: boolean
}

type DueStatus = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'scheduled'

type ResolvedDue = {
  status: DueStatus
  chip: string
  dayLabel: string
  tone: {
    badge: string
    iconBg: string
    icon: typeof faCalendarDays
  }
}

const resolveDue = (dueDate: string, t: (key: string, opts?: Record<string, unknown>) => string): ResolvedDue => {
  const diff = daysUntil(dueDate)
  if (diff < 0) {
    return {
      status: 'overdue',
      chip: t('dashboard.v2.upcoming.overdue'),
      dayLabel: t('dashboard.v2.upcoming.daysOverdue', { count: Math.abs(diff) }),
      tone: {
        badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
        iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
        icon: faTriangleExclamation,
      },
    }
  }
  if (diff === 0) {
    return {
      status: 'today',
      chip: t('dashboard.v2.upcoming.dueToday'),
      dayLabel: t('dashboard.v2.upcoming.dueToday'),
      tone: {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
        icon: faCalendarDays,
      },
    }
  }
  if (diff === 1) {
    return {
      status: 'tomorrow',
      chip: t('dashboard.v2.upcoming.dueTomorrow'),
      dayLabel: t('dashboard.v2.upcoming.dueTomorrow'),
      tone: {
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
        iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
        icon: faCalendarDays,
      },
    }
  }
  if (diff <= 7) {
    return {
      status: 'soon',
      chip: t('dashboard.v2.upcoming.soon'),
      dayLabel: t('dashboard.v2.upcoming.daysLeft', { count: diff }),
      tone: {
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
        icon: faCalendarDays,
      },
    }
  }
  return {
    status: 'scheduled',
    chip: t('dashboard.v2.upcoming.scheduled'),
    dayLabel: t('dashboard.v2.upcoming.daysLeft', { count: diff }),
    tone: {
      badge: 'bg-slate-100 text-slate-600 dark:bg-mm-bg dark:text-slate-300',
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-mm-bg dark:text-slate-300',
      icon: faCalendarDays,
    },
  }
}

export const UpcomingList: React.FC<UpcomingListProps> = ({ incoming, isLoading, hasError }) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'tr'

  const items = incoming?.incomingInstallmentsDatas ?? []

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-mm-border dark:bg-mm-card">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-mm-border">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('dashboard.v2.upcoming.title')}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.upcoming.subtitle')}
          </p>
        </div>
        <Link
          to="/installments"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          {t('dashboard.v2.upcoming.viewAll')}
          <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.errors.loadFailed')}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-300">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xl" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.upcoming.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.upcoming.emptyHint')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-mm-border">
            {items.map((item, index) => {
              const due = resolveDue(item.debtDate, t)
              return (
                <li
                  key={`${index}-${item.debtDate}`}
                  className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-mm-bg/50"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${due.tone.iconBg}`}
                  >
                    <FontAwesomeIcon icon={due.tone.icon} className="text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-mm-text">
                        {item.transaction.name}
                      </p>
                      <span className="inline-flex flex-shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-mm-bg dark:text-slate-300">
                        {item.installmentNumber}/{item.totalInstallment}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatShortDate(item.debtDate, locale)}</span>
                      <span>•</span>
                      <span>{due.dayLabel}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                      {formatTRY(item.amount)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${due.tone.badge}`}
                    >
                      {due.chip}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default UpcomingList
