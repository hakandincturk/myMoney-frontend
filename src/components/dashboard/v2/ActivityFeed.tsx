import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUp,
  faArrowDown,
  faReceipt,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import type { DashboardDTOs } from '@/types/dashboard'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY, formatShortDate, bucketOfDate, type ActivityBucket } from './formatters'

type ActivityFeedProps = {
  lastTransactions?: DashboardDTOs.LastTransactions
  isLoading: boolean
  hasError: boolean
}

type NormalisedActivity = {
  id: string
  kind: 'income' | 'expense'
  amount: number
  date: string
  title: string
  subtitle: string | null
  bucket: ActivityBucket
}

const bucketOrder: ActivityBucket[] = ['today', 'yesterday', 'earlier']

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  lastTransactions,
  isLoading,
  hasError,
}) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'tr'

  const groups = useMemo(() => {
    if (!lastTransactions?.lastTransactionData) return new Map<ActivityBucket, NormalisedActivity[]>()
    const map = new Map<ActivityBucket, NormalisedActivity[]>()
    lastTransactions.lastTransactionData.forEach((item, index) => {
      const isIncome = item.type === 'CREDIT' || item.type === 'COLLECTION'
      const entry: NormalisedActivity = {
        id: `${index}-${item.createdAt}`,
        kind: isIncome ? 'income' : 'expense',
        amount: item.totalAmount,
        date: item.createdAt,
        title: item.name || t('messages.unknownTransaction'),
        subtitle: item.description,
        bucket: bucketOfDate(item.createdAt),
      }
      const existing = map.get(entry.bucket)
      if (existing) existing.push(entry)
      else map.set(entry.bucket, [entry])
    })
    return map
  }, [lastTransactions, t])

  const total = Array.from(groups.values()).reduce((acc, arr) => acc + arr.length, 0)

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-mm-border dark:bg-mm-card">
      <header className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-mm-border">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('dashboard.v2.activity.title')}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.activity.subtitle')}
          </p>
        </div>
        <Link
          to="/debts/overview"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
        >
          {t('dashboard.v2.activity.viewAll')}
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
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.errors.loadFailed')}
            </p>
          </div>
        ) : total === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faReceipt} className="text-xl" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.activity.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.activity.emptyHint')}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-mm-border">
            {bucketOrder
              .filter((b) => groups.has(b))
              .map((bucket) => (
                <li key={bucket} className="py-1">
                  <p className="px-5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {t(`dashboard.v2.activity.${bucket}`)}
                  </p>
                  <ul>
                    {groups.get(bucket)!.map((item) => (
                      <li
                        key={item.id}
                        className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-mm-bg/50"
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ring-1 ${
                            item.kind === 'income'
                              ? 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
                              : 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={item.kind === 'income' ? faArrowUp : faArrowDown}
                            className="text-sm"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-mm-text">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            <span>{formatShortDate(item.date, locale)}</span>
                            {item.subtitle ? <span> • {item.subtitle}</span> : null}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            item.kind === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.kind === 'income' ? '+' : '-'}
                          {formatTRY(item.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default ActivityFeed
