import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendDown, faArrowTrendUp, faCalendarDay } from '@fortawesome/free-solid-svg-icons'
import { PeriodKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPercent, formatShortDate, formatTRY } from '@/utils/formatters'
import DeltaBadge from './DeltaBadge'

type ReportKpiStripProps = {
  summary?: ReportDTOs.SummaryResponse
  isLoading: boolean
  hasError: boolean
}

const CARD_CLASS =
  'flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 dark:border-mm-border dark:bg-mm-card'

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
    {children}
  </span>
)

// Savings rate can exceed the 0-100 range; the ring clamps but the tooltip keeps the raw value.
const SavingsRing: React.FC<{ rate: number }> = ({ rate }) => {
  const clamped = Math.max(0, Math.min(100, rate))
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * clamped) / 100
  const isNegative = rate < 0

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle
        cx="26"
        cy="26"
        r={radius}
        strokeWidth="6"
        className="fill-none stroke-slate-200 dark:stroke-mm-border"
      />
      <circle
        cx="26"
        cy="26"
        r={radius}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 26 26)"
        className={`fill-none transition-[stroke-dashoffset] duration-700 ${
          isNegative ? 'stroke-rose-500 dark:stroke-rose-400' : 'stroke-emerald-500 dark:stroke-emerald-400'
        }`}
      />
    </svg>
  )
}

export const ReportKpiStrip: React.FC<ReportKpiStripProps> = ({ summary, isLoading, hasError }) => {
  const { t, i18n } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={CARD_CLASS}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-8 w-32" />
            <Skeleton className="mt-1 h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (hasError || !summary) return null

  const { current, deltaVsPrevious, savingRate, averageDailyExpense, daysElapsed, daysInMonth, busiestDay } = summary
  const isPartial = current.kind === PeriodKind.PARTIAL

  /**
   * Realized spend divided by elapsed days, computed by the server. The month's full expense
   * is already known (every expense is a scheduled installment), so there is no month-end estimate.
   */
  const dailyAverage = averageDailyExpense

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total expense */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>{t('reports.kpi.totalExpense')}</Eyebrow>
          <DeltaBadge value={deltaVsPrevious.expenseChangeRate} metric="expense" />
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-mm-text">
          {formatTRY(current.expense)}
        </span>
        <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
          {t('reports.kpi.pendingPart', { amount: formatTRY(current.pendingExpense) })}
        </span>
      </div>

      {/* Total income */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>{t('reports.kpi.totalIncome')}</Eyebrow>
          <DeltaBadge value={deltaVsPrevious.incomeChangeRate} metric="income" />
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-mm-text">
          {formatTRY(current.income)}
        </span>
        <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
          {t('reports.kpi.pendingPart', { amount: formatTRY(current.pendingIncome) })}
        </span>
      </div>

      {/* Savings rate */}
      <div className={CARD_CLASS}>
        <Eyebrow>{t('reports.kpi.savingRate')}</Eyebrow>
        <div className="flex items-center gap-3">
          <SavingsRing rate={savingRate} />
          <div className="min-w-0">
            <div
              className={`flex items-center gap-1.5 text-xl font-semibold tabular-nums ${
                savingRate < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
              title={t('reports.kpi.savingRateHint')}
            >
              <FontAwesomeIcon
                icon={savingRate < 0 ? faArrowTrendDown : faArrowTrendUp}
                className="text-sm"
              />
              {formatPercent(savingRate)}
            </div>
            <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
              {t('reports.kpi.savingRateNet', { amount: formatTRY(current.net, { signed: true }) })}
            </span>
          </div>
        </div>
      </div>

      {/* Daily average — label and footnote change for a running month */}
      <div className={CARD_CLASS}>
        <div className="flex items-center justify-between gap-2">
          <Eyebrow>
            {isPartial ? t('reports.kpi.dailyAverageSoFar') : t('reports.kpi.dailyAverage')}
          </Eyebrow>
          {isPartial && (
            <span className="text-[10.5px] tabular-nums text-slate-400 dark:text-slate-500">
              {t('reports.kpi.daysOf', { elapsed: daysElapsed, total: daysInMonth })}
            </span>
          )}
        </div>
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-mm-text">
          {formatTRY(dailyAverage)}
        </span>
        {busiestDay ? (
          <span className="flex items-center gap-1.5 text-[11.5px] text-slate-500 dark:text-slate-400">
            <FontAwesomeIcon icon={faCalendarDay} className="text-[10px]" />
            {t('reports.kpi.busiestDay', {
              date: formatShortDate(busiestDay.date, i18n.language === 'en' ? 'en' : 'tr'),
              amount: formatTRY(busiestDay.amount),
            })}
          </span>
        ) : (
          <span className="text-[11.5px] text-slate-400 dark:text-slate-500">
            {t('reports.kpi.noBusiestDay')}
          </span>
        )}
      </div>
    </div>
  )
}

export default ReportKpiStrip
