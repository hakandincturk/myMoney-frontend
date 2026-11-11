import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTags, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY } from '@/utils/formatters'
import DeltaBadge from './DeltaBadge'
import { labelOfMonth, type Period } from './periodUtils'

type TagBreakdownPanelProps = {
  breakdown?: ReportDTOs.TagBreakdownResponse
  previousPeriod: Period
  isLoading: boolean
  hasError: boolean
}

export const TagBreakdownPanel: React.FC<TagBreakdownPanelProps> = ({
  breakdown,
  previousPeriod,
  isLoading,
  hasError,
}) => {
  const { t } = useTranslation()

  // Both bars share one scale so the current/previous comparison is visually honest.
  const scaleMax = useMemo(() => {
    if (!breakdown?.items.length) return 0
    return Math.max(...breakdown.items.flatMap((item) => [item.amount, item.previousAmount]))
  }, [breakdown])

  const widthOf = (value: number) => (scaleMax > 0 ? Math.max(1, (value / scaleMax) * 100) : 0)

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.tags.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('reports.tags.subtitle', {
            month: t(`months.${labelOfMonth(previousPeriod.month)}`),
          })}
        </p>
      </header>

      <div className="px-5 py-3">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="h-8 w-full" />
            ))}
          </div>
        ) : hasError ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.errors.loadFailed')}
            </p>
          </div>
        ) : !breakdown || breakdown.items.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faTags} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.tags.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('reports.tags.emptyHint')}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {breakdown.items.map((item) => {
              const isUntagged = item.tagId === null
              return (
                <li
                  key={item.tagId ?? 'untagged'}
                  className="grid grid-cols-[80px_1fr_auto] items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0 dark:border-mm-border sm:grid-cols-[96px_1fr_92px_auto]"
                >
                  <span
                    className={`truncate text-xs font-medium ${
                      isUntagged
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-900 dark:text-mm-text'
                    }`}
                    title={isUntagged ? t('reports.tags.untagged') : item.name}
                  >
                    {isUntagged ? t('reports.tags.untagged') : item.name}
                  </span>

                  <div className="flex flex-col gap-1">
                    <span
                      className={`h-2 rounded-sm ${
                        isUntagged ? 'bg-slate-400 dark:bg-slate-500' : 'bg-blue-500 dark:bg-blue-400'
                      }`}
                      style={{ width: `${widthOf(item.amount)}%` }}
                    />
                    <span
                      className="h-1 rounded-sm border border-slate-300 dark:border-slate-600"
                      style={{ width: `${widthOf(item.previousAmount)}%` }}
                      title={t('reports.tags.previousMonth', {
                        amount: formatTRY(item.previousAmount),
                      })}
                    />
                  </div>

                  <span className="hidden text-right text-xs font-semibold tabular-nums text-slate-900 dark:text-mm-text sm:block">
                    {formatTRY(item.amount)}
                  </span>

                  <DeltaBadge
                    value={item.changeRate}
                    metric="expense"
                    className="justify-self-end"
                  />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default TagBreakdownPanel
