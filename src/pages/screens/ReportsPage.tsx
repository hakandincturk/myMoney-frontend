import React, { Suspense, lazy, useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ReportFlowType, TagSumMode } from '@/enums'
import {
  useGetReportRecurringQuery,
  useGetReportSummaryQuery,
  useGetReportTagBreakdownQuery,
  useGetReportTimelineQuery,
  useGetReportTopExpensesQuery,
} from '@/services/reportApi'
import PeriodComparisonHero from '@/components/report/PeriodComparisonHero'
import RecurringExpensesPanel from '@/components/report/RecurringExpensesPanel'
import ReportInsightBar from '@/components/report/ReportInsightBar'
import ReportKpiStrip from '@/components/report/ReportKpiStrip'
import ReportPeriodBar from '@/components/report/ReportPeriodBar'
import TagBreakdownPanel from '@/components/report/TagBreakdownPanel'
import TopExpensesPanel from '@/components/report/TopExpensesPanel'
import { addMonths, defaultReportPeriod, type Period } from '@/components/report/periodUtils'

// chart.js is a heavy dependency — both chart panels load in their own chunks.
const ReportTimelineChart = lazy(() => import('@/components/report/ReportTimelineChart'))
const TagDonutPanel = lazy(() => import('@/components/report/TagDonutPanel'))

const TIMELINE_WINDOWS = [6, 12, 24] as const
type TimelineWindow = (typeof TIMELINE_WINDOWS)[number]

const STRIP_PAST = 6
const STRIP_FUTURE = 6

const ChartFallback: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-mm-border dark:bg-mm-card dark:text-slate-400">
    {label}
  </div>
)

export const ReportsPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // Period lives in the URL so a report month can be shared and survives a refresh.
  const period = useMemo<Period>(() => {
    const fallback = defaultReportPeriod()
    const year = Number(searchParams.get('year'))
    const month = Number(searchParams.get('month'))
    const isValid =
      Number.isInteger(year) && year >= 2000 && year <= 2100 && Number.isInteger(month) && month >= 1 && month <= 12
    return isValid ? { year, month } : fallback
  }, [searchParams])

  const [flowType, setFlowType] = useState<ReportFlowType>(ReportFlowType.EXPENSE)
  const [sumMode, setSumMode] = useState<TagSumMode>(TagSumMode.DISTRIBUTED)
  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>(12)

  const selectPeriod = useCallback(
    (next: Period) => {
      const params = new URLSearchParams(searchParams)
      params.set('year', next.year.toString())
      params.set('month', next.month.toString())
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  // The period strip always needs ±6 months; a wider chart window only extends the past.
  const pastMonths = Math.max(STRIP_PAST, timelineWindow - STRIP_FUTURE)

  const summaryQuery = useGetReportSummaryQuery({ year: period.year, month: period.month })
  const timelineQuery = useGetReportTimelineQuery({
    year: period.year,
    month: period.month,
    pastMonths,
    futureMonths: STRIP_FUTURE,
  })
  const breakdownQuery = useGetReportTagBreakdownQuery({
    year: period.year,
    month: period.month,
    type: flowType,
    sumMode,
  })
  const topExpensesQuery = useGetReportTopExpensesQuery({
    year: period.year,
    month: period.month,
    type: flowType,
  })
  const recurringQuery = useGetReportRecurringQuery({})

  const summary = summaryQuery.data?.data
  const timeline = timelineQuery.data?.data
  const breakdown = breakdownQuery.data?.data
  const topExpenses = topExpensesQuery.data?.data
  const recurring = recurringQuery.data?.data

  // `type: false` means the server answered but reported a failure — treat it as an error.
  const summaryFailed = !!summaryQuery.error || (!!summaryQuery.data && !summaryQuery.data.type)
  const timelineFailed = !!timelineQuery.error || (!!timelineQuery.data && !timelineQuery.data.type)
  const breakdownFailed =
    !!breakdownQuery.error || (!!breakdownQuery.data && !breakdownQuery.data.type)
  const topExpensesFailed =
    !!topExpensesQuery.error || (!!topExpensesQuery.data && !topExpensesQuery.data.type)
  const recurringFailed =
    !!recurringQuery.error || (!!recurringQuery.data && !recurringQuery.data.type)

  const previousPeriod = useMemo(() => addMonths(period, -1), [period])

  return (
    <div className="w-full bg-slate-50 px-4 pb-10 pt-6 dark:bg-mm-bg sm:px-6 md:px-8">
      <div className="flex w-full flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              myMoney
            </span>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-mm-text">
              {t('reports.title')}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              {t('reports.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-mm-border dark:bg-mm-card"
              role="group"
              aria-label={t('reports.flow.label')}
            >
              {[ReportFlowType.EXPENSE, ReportFlowType.INCOME].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFlowType(type)}
                  aria-pressed={flowType === type}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    flowType === type
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-mm-cardHover dark:text-mm-text'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {type === ReportFlowType.EXPENSE
                    ? t('reports.flow.expense')
                    : t('reports.flow.income')}
                </button>
              ))}
            </div>

            <div
              className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-mm-border dark:bg-mm-card"
              role="group"
              aria-label={t('reports.window.label')}
            >
              {TIMELINE_WINDOWS.map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setTimelineWindow(months)}
                  aria-pressed={timelineWindow === months}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    timelineWindow === months
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-mm-cardHover dark:text-mm-text'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t('reports.window.months', { count: months })}
                </button>
              ))}
            </div>
          </div>
        </header>

        <ReportPeriodBar
          selected={period}
          points={timeline?.points ?? []}
          isLoading={timelineQuery.isLoading}
          onSelect={selectPeriod}
        />

        <PeriodComparisonHero
          summary={summary}
          isLoading={summaryQuery.isLoading}
          hasError={summaryFailed}
          onSelect={selectPeriod}
        />

        <ReportKpiStrip
          summary={summary}
          isLoading={summaryQuery.isLoading}
          hasError={summaryFailed}
        />

        <Suspense fallback={<ChartFallback label={t('reports.timeline.loading')} />}>
          <ReportTimelineChart
            points={timeline?.points ?? []}
            selected={period}
            isLoading={timelineQuery.isLoading}
            hasError={timelineFailed}
            onSelect={selectPeriod}
          />
        </Suspense>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TagBreakdownPanel
            breakdown={breakdown}
            previousPeriod={previousPeriod}
            isLoading={breakdownQuery.isLoading}
            hasError={breakdownFailed}
          />
          <Suspense fallback={<ChartFallback label={t('reports.tags.loading')} />}>
            <TagDonutPanel
              breakdown={breakdown}
              sumMode={sumMode}
              isLoading={breakdownQuery.isLoading}
              hasError={breakdownFailed}
              onSumModeChange={setSumMode}
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TopExpensesPanel
            topExpenses={topExpenses}
            isLoading={topExpensesQuery.isLoading}
            hasError={topExpensesFailed}
          />
          <RecurringExpensesPanel
            recurring={recurring}
            isLoading={recurringQuery.isLoading}
            hasError={recurringFailed}
          />
        </div>

        <ReportInsightBar
          summary={summary}
          timeline={timeline}
          breakdown={breakdown}
          recurring={recurring}
        />
      </div>
    </div>
  )
}

export default ReportsPage
