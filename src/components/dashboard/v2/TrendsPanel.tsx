import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Line } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import type { ChartDataPoint } from '../../../types/charts'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChartTheme } from '../../../hooks/useCharts'
import { formatTRY, formatCompactTRY } from './formatters'

type TrendsPanelProps = {
  data: ChartDataPoint[]
  isLoading: boolean
  hasError: boolean
}

// Build a chart.js dataset config with a gradient fill that respects the current theme.
const buildChartData = (data: ChartDataPoint[]) => ({
  labels: data.map((item) => item.title),
  datasets: [
    {
      label: 'income',
      data: data.map((item) => item.income),
      borderColor: '#10B981',
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
        const { ctx, chartArea } = context.chart
        if (!chartArea) return 'rgba(16,185,129,0.1)'
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(16,185,129,0.35)')
        gradient.addColorStop(1, 'rgba(16,185,129,0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#10B981',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
    },
    {
      label: 'expense',
      data: data.map((item) => item.expense),
      borderColor: '#F43F5E',
      backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
        const { ctx, chartArea } = context.chart
        if (!chartArea) return 'rgba(244,63,94,0.1)'
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(244,63,94,0.3)')
        gradient.addColorStop(1, 'rgba(244,63,94,0)')
        return gradient
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: '#F43F5E',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2,
    },
  ],
})

// Chart.js option objects rely on loosely typed callbacks, so we intentionally keep
// the shape here as const-asserted literals.
const buildChartOptions = (
  isDark: boolean,
  t: (key: string) => string,
) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      titleColor: isDark ? '#F8FAFC' : '#0F172A',
      bodyColor: isDark ? '#CBD5E1' : '#475569',
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderWidth: 1,
      cornerRadius: 10,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      titleFont: { size: 12, weight: 600 as const },
      bodyFont: { size: 12, weight: 500 as const },
      callbacks: {
        title: (ctx: Array<{ label: string }>) => ctx[0]?.label ?? '',
        label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
          const label =
            ctx.dataset.label === 'income'
              ? t('dashboard.v2.trend.income')
              : t('dashboard.v2.trend.expense')
          const prefix = ctx.dataset.label === 'income' ? '+' : '-'
          return `  ${label}: ${prefix}₺${ctx.parsed.y.toLocaleString('tr-TR')}`
        },
        labelColor: (ctx: { dataset: { label?: string } }) => ({
          borderColor: ctx.dataset.label === 'income' ? '#10B981' : '#F43F5E',
          backgroundColor: ctx.dataset.label === 'income' ? '#10B981' : '#F43F5E',
          borderWidth: 0,
          borderRadius: 4,
        }),
      },
    },
  },
  scales: {
    x: {
      border: { display: false },
      ticks: {
        color: isDark ? '#94A3B8' : '#64748B',
        font: { size: 11 },
      },
      grid: { display: false },
    },
    y: {
      border: { display: false },
      ticks: {
        color: isDark ? '#94A3B8' : '#64748B',
        font: { size: 11 },
        maxTicksLimit: 5,
        callback: (value: number | string) =>
          typeof value === 'number' ? formatCompactTRY(value) : value,
      },
      grid: {
        color: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)',
        drawTicks: false,
      },
    },
  },
  elements: { line: { capBezierPoints: true } },
  animation: { duration: 600, easing: 'easeOutQuart' as const },
})

// Minimal KPI card used above the chart — not a separate component since it's trivial.
const MiniStat: React.FC<{
  label: string
  value: string
  tone: 'income' | 'expense' | 'net'
  positive?: boolean
}> = ({ label, value, tone, positive }) => {
  const toneColor =
    tone === 'income'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'expense'
      ? 'text-rose-600 dark:text-rose-400'
      : positive === false
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-900 dark:text-mm-text'

  const dotColor =
    tone === 'income'
      ? 'bg-emerald-500'
      : tone === 'expense'
      ? 'bg-rose-500'
      : 'bg-slate-400 dark:bg-slate-500'

  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2 dark:bg-mm-bg/60">
      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        {label}
      </span>
      <span className={`text-base font-semibold tabular-nums ${toneColor}`}>{value}</span>
    </div>
  )
}

export const TrendsPanel: React.FC<TrendsPanelProps> = ({ data, isLoading, hasError }) => {
  const { t } = useTranslation()
  const theme = useChartTheme()

  const chartData = useMemo(() => buildChartData(data), [data])
  const chartOptions = useMemo(
    () => buildChartOptions(theme.isDark, t),
    [theme.isDark, t],
  )

  const totals = useMemo(() => {
    const income = data.reduce((acc, item) => acc + (item.income || 0), 0)
    const expense = data.reduce((acc, item) => acc + (item.expense || 0), 0)
    return { income, expense, net: income - expense }
  }, [data])

  const hasData = data.length > 0 && (totals.income > 0 || totals.expense > 0)

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-mm-border dark:bg-mm-card">
      <header className="flex flex-col gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-mm-border sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('dashboard.v2.trend.title')}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.trend.subtitle')}
          </p>
        </div>

        {!isLoading && !hasError && hasData && (
          <div className="grid grid-cols-3 gap-2 sm:min-w-[280px]">
            <MiniStat
              label={t('dashboard.v2.trend.totalIncome')}
              value={formatCompactTRY(totals.income)}
              tone="income"
            />
            <MiniStat
              label={t('dashboard.v2.trend.totalExpense')}
              value={formatCompactTRY(totals.expense)}
              tone="expense"
            />
            <MiniStat
              label={t('dashboard.v2.trend.net')}
              value={`${totals.net >= 0 ? '+' : '-'}${formatCompactTRY(Math.abs(totals.net))}`}
              tone="net"
              positive={totals.net >= 0}
            />
          </div>
        )}
      </header>

      <div className="relative px-4 pb-4 pt-3">
        {isLoading ? (
          <div className="flex h-72 flex-col gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ) : hasError ? (
          <div className="flex h-72 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.errors.loadFailed')}
            </p>
          </div>
        ) : !hasData ? (
          <div className="flex h-72 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.trend.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.trend.emptyHint')}
            </p>
          </div>
        ) : (
          <>
            {/* Custom HTML legend sits outside the canvas for crisp typography. */}
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t('dashboard.v2.trend.income')}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {t('dashboard.v2.trend.expense')}
              </span>
              <span className="ml-auto text-slate-500 dark:text-slate-400">
                {t('dashboard.v2.trend.net')}: {formatTRY(totals.net, { signed: true })}
              </span>
            </div>
            <div className="h-72">
              <Line data={chartData} options={chartOptions} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default TrendsPanel
