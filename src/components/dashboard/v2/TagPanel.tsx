import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Doughnut } from 'react-chartjs-2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartPie, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useGetTagSummaryQuery } from '@/services/dashboardApi'
import { useChartControls, useChartTheme } from '../../../hooks/useCharts'
import { ChartDataProcessor, DateUtils } from '../../../utils/chartUtils'
import type { TagData, PeriodType, SumModeType } from '../../../types/charts'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY, formatCompactTRY, formatPercent } from './formatters'

type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedToggleProps<T extends string> = {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-xs dark:bg-mm-bg"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 font-medium transition-all duration-150 ${
              active
                ? 'bg-white text-slate-900 shadow-sm dark:bg-mm-card dark:text-mm-text'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-mm-text'
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const buildDoughnutOptions = (isDark: boolean, t: (key: string) => string) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
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
      displayColors: false,
      titleFont: { size: 12, weight: 600 as const },
      bodyFont: { size: 12, weight: 500 as const },
      callbacks: {
        title: (ctx: Array<{ label: string }>) => ctx[0]?.label ?? '',
        label: (ctx: { parsed: number; dataset: { data: number[] } }) => {
          const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const pct = total > 0 ? (ctx.parsed / total) * 100 : 0
          return `  ₺${ctx.parsed.toLocaleString('tr-TR')} �� %${pct.toFixed(1)}`
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 2,
      borderColor: isDark ? '#1E1E1E' : '#FFFFFF',
      hoverOffset: 6,
      borderRadius: 2,
    },
  },
  animation: { animateRotate: true, animateScale: false, duration: 600 },
})

type TagLegendItemProps = {
  tag: TagData
  total: number
}

const TagLegendItem: React.FC<TagLegendItemProps> = ({ tag, total }) => {
  const pct = total > 0 ? (tag.amount / total) * 100 : 0
  return (
    <li className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-mm-bg/60">
      <span
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full ring-2 ring-white dark:ring-mm-card"
        style={{ backgroundColor: tag.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-slate-800 dark:text-slate-200">{tag.name}</p>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-mm-bg">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: tag.color }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-mm-text">
          {formatCompactTRY(tag.amount)}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {formatPercent(pct)}
        </span>
      </div>
    </li>
  )
}

export const TagPanel: React.FC = () => {
  const { t } = useTranslation()
  const theme = useChartTheme()
  const { tagPeriod, tagSumMode, setTagPeriod, setTagSumMode } =
    useChartControls()

  const { startDate, endDate } = DateUtils.getDateRange(tagPeriod)

  const {
    data: tagSummaryData,
    isFetching,
    error,
  } = useGetTagSummaryQuery(
    { startDate, endDate, type: tagPeriod, sumMode: tagSumMode },
    { refetchOnMountOrArgChange: true },
  )

  const tags = useMemo(
    () => ChartDataProcessor.processTags(tagSummaryData),
    [tagSummaryData],
  )

  const totalSpent = useMemo(
    () => tags.reduce((acc, c) => acc + c.amount, 0),
    [tags],
  )

  const chartData = useMemo(
    () => ChartDataProcessor.createDoughnutChartData(tags, theme.isDark),
    [tags, theme.isDark],
  )

  const chartOptions = useMemo(() => buildDoughnutOptions(theme.isDark, t), [theme.isDark, t])

  const periodOptions: SegmentedOption<PeriodType>[] = [
    { value: 'MONTHLY', label: t('dashboard.v2.tag.period.monthly') },
    { value: 'YEARLY', label: t('dashboard.v2.tag.period.yearly') },
  ]

  const sumModeOptions: SegmentedOption<SumModeType>[] = [
    { value: 'DISTRIBUTED', label: t('dashboard.v2.tag.sumMode.distributed') },
    { value: 'DOUBLE_COUNT', label: t('dashboard.v2.tag.sumMode.doubleCount') },
  ]

  const hasError = !!error
  const isLoading = isFetching
  const hasData = tags.length > 0

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-mm-border dark:bg-mm-card">
      <header className="flex flex-col gap-3 border-b border-slate-200/70 px-5 py-4 dark:border-mm-border">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
              {t('dashboard.v2.tag.title')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.tag.subtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedToggle
              options={periodOptions}
              value={tagPeriod}
              onChange={setTagPeriod}
              ariaLabel={t('dashboard.period')}
            />
            <SegmentedToggle
              options={sumModeOptions}
              value={tagSumMode}
              onChange={setTagSumMode}
              ariaLabel={t('dashboard.sumMode')}
            />
          </div>
        </div>
      </header>

      <div className="px-5 py-5">
        {isLoading ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Skeleton className="h-56 w-56 rounded-full" />
            <div className="flex-1 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
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
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('dashboard.v2.tag.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.tag.emptyHint')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:items-center">
            <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('dashboard.v2.tag.totalSpent')}
                </span>
                <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-mm-text">
                  {formatTRY(totalSpent)}
                </span>
              </div>
            </div>

            <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto custom-scrollbar pr-1">
              {tags.map((tag) => (
                <TagLegendItem
                  key={tag.name}
                  tag={tag}
                  total={totalSpent}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default TagPanel
