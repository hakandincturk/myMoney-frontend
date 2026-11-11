import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PeriodKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { formatPercent, formatTRY } from '@/utils/formatters'
import { labelOfMonth } from './periodUtils'

type ReportInsightBarProps = {
  summary?: ReportDTOs.SummaryResponse
  timeline?: ReportDTOs.TimelineResponse
  breakdown?: ReportDTOs.TagBreakdownResponse
  recurring?: ReportDTOs.RecurringResponse
}

type Insight = {
  id: string
  text: string
  tone: 'good' | 'warn' | 'bad'
}

const TONE_CLASSES: Record<Insight['tone'], string> = {
  good: 'bg-emerald-500',
  warn: 'bg-amber-500',
  bad: 'bg-rose-500',
}

const MAX_INSIGHTS = 3

/**
 * Rule-based summary derived entirely from data already on screen — deliberately no
 * extra endpoint. Each rule is independent and simply skipped when its input is missing.
 */
export const ReportInsightBar: React.FC<ReportInsightBarProps> = ({
  summary,
  timeline,
  breakdown,
  recurring,
}) => {
  const { t } = useTranslation()

  const insights = useMemo(() => {
    const result: Insight[] = []

    // 1) Steepest tag increase this month.
    const rising = (breakdown?.items ?? [])
      .filter((item) => item.changeRate !== null && item.changeRate > 0)
      .sort((a, b) => (b.changeRate ?? 0) - (a.changeRate ?? 0))[0]
    if (rising) {
      result.push({
        id: 'tag-increase',
        tone: 'bad',
        text: t('reports.insight.tagIncreased', {
          name: rising.tagId === null ? t('reports.tags.untagged') : rising.name,
          rate: formatPercent(rising.changeRate ?? 0),
          from: formatTRY(rising.previousAmount),
          to: formatTRY(rising.amount),
        }),
      })
    }

    // 2) Worst projected month ahead.
    const deficit = (timeline?.points ?? [])
      .filter((point) => point.kind === PeriodKind.PROJECTED && point.net < 0)
      .sort((a, b) => a.net - b.net)[0]
    if (deficit) {
      result.push({
        id: 'projected-deficit',
        tone: 'warn',
        text: t('reports.insight.projectedDeficit', {
          month: t(`months.${labelOfMonth(deficit.month)}`),
          year: deficit.year,
          amount: formatTRY(Math.abs(deficit.net)),
        }),
      })
    }

    // 3) Longest running fixed cost, with its share of the total fixed cost.
    const longest = [...(recurring?.items ?? [])].sort((a, b) => b.monthsSpan - a.monthsSpan)[0]
    if (longest && recurring && recurring.monthlyFixedCost > 0) {
      result.push({
        id: 'longest-recurring',
        tone: 'good',
        text: t('reports.insight.longestRecurring', {
          name: longest.name,
          count: longest.monthsSpan,
          share: formatPercent((longest.averageAmount / recurring.monthlyFixedCost) * 100),
        }),
      })
    }

    // Fallback when nothing above fired but the month is still in the red.
    if (result.length === 0 && summary && summary.savingRate < 0) {
      result.push({
        id: 'negative-saving',
        tone: 'bad',
        text: t('reports.insight.negativeSaving', {
          rate: formatPercent(Math.abs(summary.savingRate)),
        }),
      })
    }

    return result.slice(0, MAX_INSIGHTS)
  }, [summary, timeline, breakdown, recurring, t])

  if (insights.length === 0) return null

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.insight.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('reports.insight.subtitle')}
        </p>
      </header>

      <ul className="px-5 py-1">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="flex items-stretch gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-mm-border"
          >
            <span className={`w-1 shrink-0 rounded-full ${TONE_CLASSES[insight.tone]}`} />
            <p className="text-[13px] text-slate-700 dark:text-slate-200">{insight.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ReportInsightBar
