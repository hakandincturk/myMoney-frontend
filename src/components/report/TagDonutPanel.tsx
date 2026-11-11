import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartPie, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { TagSumMode } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { CHART_COLORS } from '@/constants/charts'
import { useChartTheme } from '@/hooks/useCharts'
import { formatCompactTRY, formatPercent, formatTRY } from '@/utils/formatters'
import DeltaBadge from './DeltaBadge'

ChartJS.register(ArcElement, Tooltip, Legend)

type TagDonutPanelProps = {
  breakdown?: ReportDTOs.TagBreakdownResponse
  sumMode: TagSumMode
  isLoading: boolean
  hasError: boolean
  onSumModeChange: (mode: TagSumMode) => void
}

const UNTAGGED_COLOR = '#94A3B8'
const OTHER_COLOR = '#CBD5E1'
const TOP_LIST_SIZE = 5

export const TagDonutPanel: React.FC<TagDonutPanelProps> = ({
  breakdown,
  sumMode,
  isLoading,
  hasError,
  onSumModeChange,
}) => {
  const { t } = useTranslation()
  const theme = useChartTheme()

  /**
   * `total` is not capped by `limit`, so anything the server trimmed shows up as an
   * explicit "other" slice. Only meaningful in DISTRIBUTED mode, where the tag amounts
   * add up to the period total.
   */
  const slices = useMemo(() => {
    if (!breakdown) return []

    const base = breakdown.items.map((item, index) => ({
      key: item.tagId === null ? 'untagged' : `tag-${item.tagId}`,
      name: item.tagId === null ? t('reports.tags.untagged') : item.name,
      amount: item.amount,
      color: item.tagId === null ? UNTAGGED_COLOR : CHART_COLORS[index % CHART_COLORS.length],
    }))

    if (sumMode === TagSumMode.DISTRIBUTED) {
      const listed = breakdown.items.reduce((sum, item) => sum + item.amount, 0)
      const remainder = breakdown.total - listed
      if (remainder > 0.5) {
        base.push({
          key: 'other',
          name: t('reports.tags.other'),
          amount: remainder,
          color: OTHER_COLOR,
        })
      }
    }

    return base
  }, [breakdown, sumMode, t])

  const chartData = useMemo(
    () => ({
      labels: slices.map((slice) => slice.name),
      datasets: [
        {
          data: slices.map((slice) => slice.amount),
          backgroundColor: slices.map((slice) => slice.color),
          borderColor: theme.isDark ? '#1E1E1E' : '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [slices, theme.isDark],
  )

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.isDark ? '#0F172A' : '#FFFFFF',
          titleColor: theme.isDark ? '#F8FAFC' : '#0F172A',
          bodyColor: theme.isDark ? '#CBD5E1' : '#475569',
          borderColor: theme.isDark ? '#334155' : '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (ctx: { label: string; parsed: number; dataset: { data: number[] } }) => {
              const sum = ctx.dataset.data.reduce((acc, value) => acc + value, 0)
              const share = sum > 0 ? (ctx.parsed / sum) * 100 : 0
              return `${ctx.label}: ${formatTRY(ctx.parsed)} (${formatPercent(share)})`
            },
          },
        },
      },
      animation: { duration: 500 },
    }),
    [theme.isDark],
  )

  const hasData = slices.length > 0 && slices.some((slice) => slice.amount > 0)

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('reports.tags.distributionTitle')}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {breakdown
              ? t('reports.tags.distributionSubtitle', {
                  total: formatTRY(breakdown.total),
                  count: breakdown.items.length,
                })
              : t('reports.tags.distributionTitle')}
          </p>
        </div>

        <div
          className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-mm-border dark:bg-mm-bg"
          role="group"
          aria-label={t('reports.tags.sumMode')}
        >
          {[TagSumMode.DISTRIBUTED, TagSumMode.DOUBLE_COUNT].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSumModeChange(mode)}
              aria-pressed={sumMode === mode}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                sumMode === mode
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-mm-card dark:text-mm-text'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {mode === TagSumMode.DISTRIBUTED
                ? t('reports.tags.distributed')
                : t('reports.tags.doubleCount')}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-40 w-40" rounded="full" />
            <Skeleton className="h-24 w-full" />
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
        ) : !hasData || !breakdown ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.tags.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('reports.tags.emptyHint')}
            </p>
          </div>
        ) : (
          <>
            <div className="relative mx-auto h-44 w-44">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                  {formatCompactTRY(breakdown.total)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('reports.tags.categoryCount', { count: breakdown.items.length })}
                </span>
              </div>
            </div>

            <ul className="mt-4 flex flex-col">
              {breakdown.items.slice(0, TOP_LIST_SIZE).map((item, index) => (
                <li
                  key={item.tagId ?? 'untagged'}
                  className="flex items-center gap-3 border-b border-slate-100 py-2 text-xs last:border-b-0 dark:border-mm-border"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{
                      backgroundColor:
                        item.tagId === null
                          ? UNTAGGED_COLOR
                          : CHART_COLORS[index % CHART_COLORS.length],
                    }}
                  />
                  <span
                    className={`flex-1 truncate ${
                      item.tagId === null
                        ? 'text-slate-500 dark:text-slate-400'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.tagId === null ? t('reports.tags.untagged') : item.name}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                    {formatPercent(item.percentage)}
                  </span>
                  <DeltaBadge value={item.changeRate} metric="expense" />
                </li>
              ))}
            </ul>

            {breakdown.untaggedAmount > 0 && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:bg-mm-bg dark:text-slate-300">
                {t('reports.tags.untaggedCallout', {
                  amount: formatTRY(breakdown.untaggedAmount),
                  share: formatPercent(
                    breakdown.total > 0 ? (breakdown.untaggedAmount / breakdown.total) * 100 : 0,
                  ),
                })}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default TagDonutPanel
