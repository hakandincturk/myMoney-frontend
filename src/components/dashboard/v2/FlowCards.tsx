import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons'
import { Skeleton } from '@/components/ui/Skeleton'
import type { DashboardDTOs } from '@/types/dashboard'
import { formatTRY, formatPercent } from './formatters'

type FlowKind = 'income' | 'expense'

type FlowCardProps = {
  kind: FlowKind
  data: DashboardDTOs.QuickViewIncomeAndExpenseDetailDto
}

const toneByKind: Record<FlowKind, {
  accent: string
  accentBg: string
  realizedBar: string
  expectedBar: string
  ring: string
  deltaPositive: string
  deltaNegative: string
  inverted: boolean
}> = {
  income: {
    accent: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    realizedBar: 'bg-emerald-500 dark:bg-emerald-400',
    expectedBar: 'bg-emerald-200 dark:bg-emerald-500/30',
    ring: 'ring-emerald-200/60 dark:ring-emerald-500/20',
    deltaPositive: 'text-emerald-600 dark:text-emerald-400',
    deltaNegative: 'text-rose-600 dark:text-rose-400',
    inverted: false,
  },
  expense: {
    accent: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    realizedBar: 'bg-rose-500 dark:bg-rose-400',
    expectedBar: 'bg-rose-200 dark:bg-rose-500/30',
    ring: 'ring-rose-200/60 dark:ring-rose-500/20',
    deltaPositive: 'text-rose-600 dark:text-rose-400',
    deltaNegative: 'text-emerald-600 dark:text-emerald-400',
    inverted: true,
  },
}

const FlowCard: React.FC<FlowCardProps> = ({ kind, data }) => {
  const { t } = useTranslation()
  const tone = toneByKind[kind]

  const realized = data.occured ?? 0
  const expected = data.waiting ?? 0
  const total = realized + expected
  const completion = total > 0 ? (realized / total) * 100 : 0

  const title = t(kind === 'income' ? 'dashboard.v2.flow.income' : 'dashboard.v2.flow.expense')
  const subtitle = t(
    kind === 'income' ? 'dashboard.v2.flow.incomeSubtitle' : 'dashboard.v2.flow.expenseSubtitle',
  )

  const change = data.lastMonthChangeRate
  const hasChange = change !== undefined && change !== null
  // For expense cards an increase is a negative signal, so the color logic inverts.
  const positive = hasChange
    ? tone.inverted
      ? (change as number) < 0
      : (change as number) >= 0
    : false
  const isZero = change === 0

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-mm-border dark:bg-mm-card ring-1 ${tone.ring}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.accentBg}`}
          >
            <FontAwesomeIcon
              icon={kind === 'income' ? faArrowTrendUp : faArrowTrendDown}
              className="text-base"
            />
          </span>
          <div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        {hasChange && (
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-mm-bg ${
              isZero
                ? 'text-slate-500 dark:text-slate-400'
                : positive
                ? tone.deltaPositive
                : tone.deltaNegative
            }`}
            title={t('dashboard.v2.hero.lastMonth')}
          >
            {isZero ? '→' : (change as number) >= 0 ? '↗' : '↘'} {formatPercent(Math.abs(change as number))}
          </span>
        )}
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-semibold tracking-tight ${tone.accent}`}>
            {formatTRY(total)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.flow.total')}
          </span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{t('dashboard.v2.flow.completion')}</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {formatPercent(completion, 0)}
          </span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-mm-border">
          <div
            className={`${tone.realizedBar} transition-all duration-700`}
            style={{ width: `${total > 0 ? (realized / total) * 100 : 0}%` }}
          />
          <div
            className={`${tone.expectedBar} transition-all duration-700`}
            style={{ width: `${total > 0 ? (expected / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Split legend */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-mm-bg/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={`h-2 w-2 rounded-full ${tone.realizedBar}`} />
            <span>{t('dashboard.v2.flow.realized')}</span>
          </div>
          <p className={`mt-1 text-lg font-semibold ${tone.accent}`}>{formatTRY(realized)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-mm-bg/60">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className={`h-2 w-2 rounded-full ${tone.expectedBar}`} />
            <span>{t('dashboard.v2.flow.expected')}</span>
          </div>
          <p className={`mt-1 text-lg font-semibold ${tone.accent}`}>{formatTRY(expected)}</p>
        </div>
      </div>
    </section>
  )
}

type FlowCardsProps = {
  quickView?: DashboardDTOs.QuickViewResponseDto
  isLoading: boolean
  hasError: boolean
}

export const FlowCards: React.FC<FlowCardsProps> = ({ quickView, isLoading, hasError }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-mm-border dark:bg-mm-card"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-10 w-40" />
            <Skeleton className="mt-4 h-2 w-full" />
            <Skeleton className="mt-4 h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (hasError || !quickView) return null

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FlowCard kind="income" data={quickView.income} />
      <FlowCard kind="expense" data={quickView.expense} />
    </div>
  )
}

export default FlowCards
