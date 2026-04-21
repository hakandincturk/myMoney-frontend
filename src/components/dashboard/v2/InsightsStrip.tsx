import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPiggyBank, faHourglassHalf, faScaleBalanced } from '@fortawesome/free-solid-svg-icons'
import { Skeleton } from '@/components/ui/Skeleton'
import type { DashboardDTOs } from '@/types/dashboard'
import { formatPercent, formatCompactTRY } from './formatters'

type InsightsStripProps = {
  quickView?: DashboardDTOs.QuickViewResponseDto
  isLoading: boolean
  hasError: boolean
}

// Normalises savings rate into 0-100 clamp (server may return slightly out-of-range values).
const clampRate = (rate: number): number => Math.max(0, Math.min(100, rate))

const SavingsRing: React.FC<{ rate: number }> = ({ rate }) => {
  const safeRate = clampRate(rate)
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (circumference * safeRate) / 100

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={radius}
          strokeWidth="8"
          className="fill-none stroke-slate-200 dark:stroke-mm-border"
        />
        <circle
          cx="36"
          cy="36"
          r={radius}
          strokeWidth="8"
          strokeLinecap="round"
          className="fill-none stroke-emerald-500 transition-[stroke-dashoffset] duration-700 dark:stroke-emerald-400"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-800 dark:text-mm-text">
        {formatPercent(safeRate, 0)}
      </div>
    </div>
  )
}

export const InsightsStrip: React.FC<InsightsStripProps> = ({ quickView, isLoading, hasError }) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-mm-border dark:bg-mm-card"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-10 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (hasError) return null

  const savingsRate = quickView?.savingRate ?? 0
  const pending = quickView?.waitingInstallments ?? 0
  const netFlow = (quickView?.income?.occured ?? 0) - (quickView?.expense?.occured ?? 0)
  const netPositive = netFlow >= 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Savings rate */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-mm-border dark:bg-mm-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                <FontAwesomeIcon icon={faPiggyBank} className="text-sm" />
              </span>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('dashboard.v2.insights.savingsRate')}
              </p>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.insights.savingsRateHint')}
            </p>
          </div>
          <SavingsRing rate={savingsRate} />
        </div>
      </div>

      {/* Pending installments */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-mm-border dark:bg-mm-card">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
            <FontAwesomeIcon icon={faHourglassHalf} className="text-sm" />
          </span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('dashboard.v2.insights.pendingInstallments')}
          </p>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-slate-900 dark:text-mm-text">{pending}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.insights.count')}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('dashboard.v2.insights.pendingInstallmentsHint')}
        </p>
      </div>

      {/* Net flow */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-mm-border dark:bg-mm-card">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              netPositive
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
            }`}
          >
            <FontAwesomeIcon icon={faScaleBalanced} className="text-sm" />
          </span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('dashboard.v2.insights.netFlow')}
          </p>
        </div>
        <div className="mt-4">
          <span
            className={`text-3xl font-semibold ${
              netPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netPositive ? '+' : ''}
            {formatCompactTRY(netFlow)}
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('dashboard.v2.insights.netFlowHint')}
        </p>
      </div>
    </div>
  )
}

export default InsightsStrip
