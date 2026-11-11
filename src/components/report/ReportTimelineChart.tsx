import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartColumn, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { PeriodKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChartTheme } from '@/hooks/useCharts'
import { formatCompactTRY, formatTRY } from '@/utils/formatters'
import { labelOfMonth, samePeriod, type Period } from './periodUtils'

// Registered once for the report bundle; chart.js registration is idempotent.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

type ReportTimelineChartProps = {
  points: ReportDTOs.TimelinePoint[]
  selected: Period
  isLoading: boolean
  hasError: boolean
  onSelect: (period: Period) => void
}

const INCOME = '#10B981'
const EXPENSE = '#F43F5E'
const DEBT = '#F59E0B'

// Projected months are drawn washed out; the dashed border and the legend note carry the
// same information for anyone who cannot rely on colour alone.
const alphaFor = (kind: PeriodKind, isSelected: boolean): number => {
  if (kind === PeriodKind.PROJECTED) return 0.35
  return isSelected ? 1 : 0.75
}

const withAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const ReportTimelineChart: React.FC<ReportTimelineChartProps> = ({
  points,
  selected,
  isLoading,
  hasError,
  onSelect,
}) => {
  const { t } = useTranslation()
  const theme = useChartTheme()

  const hasData = points.length > 0 && points.some((p) => p.income > 0 || p.expense > 0)

  const chartData = useMemo(() => {
    const labels = points.map((point) => t(`months.${labelOfMonth(point.month)}`))
    const selectedFlags = points.map((point) =>
      samePeriod({ year: point.year, month: point.month }, selected),
    )

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'income',
          data: points.map((point) => point.income),
          backgroundColor: points.map((point, index) =>
            withAlpha(INCOME, alphaFor(point.kind, selectedFlags[index])),
          ),
          borderColor: points.map((point) =>
            point.kind === PeriodKind.PROJECTED ? INCOME : 'transparent',
          ),
          borderWidth: points.map((point) => (point.kind === PeriodKind.PROJECTED ? 1.5 : 0)),
          borderRadius: 3,
          borderSkipped: false as const,
          order: 2,
          yAxisID: 'y',
        },
        {
          type: 'bar' as const,
          label: 'expense',
          data: points.map((point) => point.expense),
          backgroundColor: points.map((point, index) =>
            withAlpha(EXPENSE, alphaFor(point.kind, selectedFlags[index])),
          ),
          borderColor: points.map((point) =>
            point.kind === PeriodKind.PROJECTED ? EXPENSE : 'transparent',
          ),
          borderWidth: points.map((point) => (point.kind === PeriodKind.PROJECTED ? 1.5 : 0)),
          borderRadius: 3,
          borderSkipped: false as const,
          order: 2,
          yAxisID: 'y',
        },
        {
          // Forward looking debt curve. cumulativeRemainingDebt is intentionally NOT plotted:
          // it is flat in the future and would be read as "debt never goes down".
          type: 'line' as const,
          label: 'debt',
          data: points.map((point) => point.projectedRemainingDebt),
          borderColor: DEBT,
          backgroundColor: withAlpha(DEBT, 0.12),
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: DEBT,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          fill: true,
          order: 1,
          yAxisID: 'y1',
        },
      ],
    }
  }, [points, selected, t])

  const options = useMemo(() => {
    const isDark = theme.isDark
    const axisColor = isDark ? '#94A3B8' : '#64748B'
    const gridColor = isDark ? 'rgba(148,163,184,0.12)' : 'rgba(148,163,184,0.18)'

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      onClick: (_event: unknown, elements: Array<{ index: number }>) => {
        const index = elements[0]?.index
        if (index === undefined) return
        const point = points[index]
        if (point) onSelect({ year: point.year, month: point.month })
      },
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
          callbacks: {
            title: (ctx: Array<{ dataIndex: number }>) => {
              const point = points[ctx[0]?.dataIndex ?? 0]
              if (!point) return ''
              const kindKey =
                point.kind === PeriodKind.PROJECTED
                  ? 'reports.period.projected'
                  : point.kind === PeriodKind.PARTIAL
                  ? 'reports.period.partial'
                  : 'reports.period.actual'
              return `${t(`months.${labelOfMonth(point.month)}`)} ${point.year} · ${t(kindKey)}`
            },
            label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) => {
              const key =
                ctx.dataset.label === 'income'
                  ? 'reports.timeline.income'
                  : ctx.dataset.label === 'expense'
                  ? 'reports.timeline.expense'
                  : 'reports.timeline.remainingDebt'
              return `  ${t(key)}: ${formatTRY(ctx.parsed.y)}`
            },
            afterBody: (ctx: Array<{ dataIndex: number }>) => {
              const point = points[ctx[0]?.dataIndex ?? 0]
              if (!point) return []
              return [
                `${t('reports.timeline.net')}: ${formatTRY(point.net, { signed: true })}`,
                `${t('reports.timeline.carriedDebt')}: ${formatTRY(point.cumulativeRemainingDebt)}`,
              ]
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          border: { display: false },
          ticks: { color: axisColor, font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          border: { display: false },
          ticks: {
            color: axisColor,
            font: { size: 11 },
            maxTicksLimit: 5,
            callback: (value: number | string) =>
              typeof value === 'number' ? formatCompactTRY(value) : value,
          },
          grid: { color: gridColor, drawTicks: false },
        },
        y1: {
          position: 'right' as const,
          border: { display: false },
          ticks: {
            color: DEBT,
            font: { size: 11 },
            maxTicksLimit: 4,
            callback: (value: number | string) =>
              typeof value === 'number' ? formatCompactTRY(value) : value,
          },
          grid: { display: false },
        },
      },
      animation: { duration: 500, easing: 'easeOutQuart' as const },
    }
  }, [theme.isDark, points, onSelect, t])

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.timeline.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('reports.timeline.projectedHint')}
        </p>
      </header>

      <div className="px-4 pb-4 pt-3">
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
              {t('reports.errors.loadFailed')}
            </p>
          </div>
        ) : !hasData ? (
          <div className="flex h-72 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faChartColumn} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.timeline.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('reports.timeline.emptyHint')}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                {t('reports.timeline.income')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-rose-500" />
                {t('reports.timeline.expense')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-sm bg-amber-500" />
                {t('reports.timeline.remainingDebt')}
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-slate-400 dark:border-slate-500" />
                {t('reports.timeline.plan')}
              </span>
            </div>
            <div className="h-72">
              <Chart type="bar" data={chartData} options={options} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ReportTimelineChart
