import React, { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PeriodKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCompactTRY } from '@/utils/formatters'
import { labelOfMonth, periodRange, samePeriod, type Period } from './periodUtils'

type ReportPeriodBarProps = {
  selected: Period
  points: ReportDTOs.TimelinePoint[]
  isLoading: boolean
  onSelect: (period: Period) => void
}

const STRIP_PAST = 6
const STRIP_FUTURE = 6

export const ReportPeriodBar: React.FC<ReportPeriodBarProps> = ({
  selected,
  points,
  isLoading,
  onSelect,
}) => {
  const { t } = useTranslation()
  const selectedRef = useRef<HTMLButtonElement>(null)

  // Index the server points so each chip can show its own net without a lookup loop.
  const netByPeriod = useMemo(() => {
    const map = new Map<string, { net: number; kind: PeriodKind }>()
    points.forEach((point) => {
      map.set(`${point.year}-${point.month}`, { net: point.net, kind: point.kind })
    })
    return map
  }, [points])

  const periods = useMemo(() => periodRange(selected, STRIP_PAST, STRIP_FUTURE), [selected])

  // Keep the active chip in view when the period changes from outside the strip.
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
  }, [selected.year, selected.month])

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.period.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('reports.period.subtitle')}
        </p>
      </header>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex min-w-max gap-2 px-5 py-4">
          {periods.map((period) => {
            const key = `${period.year}-${period.month}`
            const entry = netByPeriod.get(key)
            const kind = entry?.kind
            const isSelected = samePeriod(period, selected)
            const isProjected = kind === PeriodKind.PROJECTED
            const isPartial = kind === PeriodKind.PARTIAL

            const borderClass = isSelected
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:border-blue-400 dark:bg-blue-500/10 dark:ring-blue-400'
              : isProjected
              ? 'border-dashed border-amber-400 bg-transparent dark:border-amber-500/70'
              : isPartial
              ? 'border-blue-300 bg-white dark:border-blue-500/60 dark:bg-mm-card'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-mm-border dark:bg-mm-card dark:hover:bg-mm-cardHover'

            const monthClass = isProjected
              ? 'text-amber-700 dark:text-amber-300'
              : 'text-slate-900 dark:text-mm-text'

            return (
              <button
                key={key}
                type="button"
                ref={isSelected ? selectedRef : undefined}
                onClick={() => onSelect(period)}
                aria-current={isSelected}
                className={`flex w-[92px] shrink-0 flex-col gap-0.5 rounded-xl border px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-mm-card ${borderClass}`}
              >
                <span className={`text-xs font-semibold ${monthClass}`}>
                  {t(`months.${labelOfMonth(period.month)}`)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{period.year}</span>
                {isLoading ? (
                  <Skeleton className="mt-1 h-3.5 w-14" />
                ) : entry ? (
                  <span
                    className={`mt-0.5 text-xs font-semibold tabular-nums ${
                      entry.net >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {entry.net >= 0 ? '+' : '−'}
                    {formatCompactTRY(Math.abs(entry.net))}
                  </span>
                ) : (
                  <span className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">—</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ReportPeriodBar
