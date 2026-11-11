import React from 'react'
import { useTranslation } from 'react-i18next'
import { PeriodKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY } from '@/utils/formatters'
import DeltaBadge from './DeltaBadge'
import PeriodKindBadge from './PeriodKindBadge'
import { labelOfMonth, type Period } from './periodUtils'

type PeriodComparisonHeroProps = {
  summary?: ReportDTOs.SummaryResponse
  isLoading: boolean
  hasError: boolean
  onSelect: (period: Period) => void
}

type SideColumnProps = {
  totals: ReportDTOs.PeriodTotals
  caption: string
  delta?: ReportDTOs.PeriodDelta
  onSelect: () => void
}

const AmountRow: React.FC<{
  label: string
  value: number
  emphasis?: boolean
  tone?: 'neutral' | 'signed'
  delta?: React.ReactNode
  divider?: boolean
}> = ({ label, value, emphasis = false, tone = 'neutral', delta, divider = false }) => {
  const valueTone =
    tone === 'signed'
      ? value >= 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-600 dark:text-rose-400'
      : 'text-slate-900 dark:text-mm-text'

  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        divider ? 'border-t border-slate-100 pt-2 dark:border-mm-border' : ''
      }`}
    >
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="flex items-baseline gap-2">
        <span
          className={`font-semibold tabular-nums ${emphasis ? 'text-lg' : 'text-sm'} ${valueTone}`}
        >
          {tone === 'signed' ? formatTRY(value, { signed: true }) : formatTRY(value)}
        </span>
        {delta}
      </span>
    </div>
  )
}

const SideColumn: React.FC<SideColumnProps> = ({ totals, caption, delta, onSelect }) => {
  const { t } = useTranslation()
  const isProjected = totals.kind === PeriodKind.PROJECTED

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isProjected
          ? 'border-dashed border-amber-400 bg-transparent hover:bg-amber-50/50 dark:border-amber-500/70 dark:hover:bg-amber-500/5'
          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-mm-border dark:bg-mm-card dark:hover:bg-mm-cardHover'
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t(`months.${labelOfMonth(totals.month)}`)} {totals.year}
        </span>
        <PeriodKindBadge kind={totals.kind} />
      </div>

      <div className="flex flex-col gap-2">
        <AmountRow
          label={t('reports.comparison.income')}
          value={totals.income}
          delta={delta && <DeltaBadge value={delta.incomeChangeRate} metric="income" />}
        />
        <AmountRow
          label={t('reports.comparison.expense')}
          value={totals.expense}
          delta={delta && <DeltaBadge value={delta.expenseChangeRate} metric="expense" />}
        />
        <AmountRow
          label={t('reports.comparison.net')}
          value={totals.net}
          tone="signed"
          divider
          delta={
            delta && <DeltaBadge value={delta.netChangeAmount} metric="net" format="currency" />
          }
        />
      </div>

      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {caption}
      </span>
    </button>
  )
}

export const PeriodComparisonHero: React.FC<PeriodComparisonHeroProps> = ({
  summary,
  isLoading,
  hasError,
  onSelect,
}) => {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-mm-border dark:bg-mm-card"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-6 w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  if (hasError || !summary) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 dark:border-mm-border dark:bg-mm-card dark:text-slate-300">
        {t('reports.errors.loadFailed')}
      </div>
    )
  }

  const { current, previous, next, deltaVsPrevious, deltaVsNext } = summary
  const realizedShare = current.expense > 0 ? (current.realizedExpense / current.expense) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <SideColumn
        totals={previous}
        caption={t('reports.period.previous')}
        onSelect={() => onSelect({ year: previous.year, month: previous.month })}
      />

      {/* Selected period — the only column that carries its own emphasis ring. */}
      <section className="flex flex-col gap-4 rounded-2xl border border-blue-500 bg-white p-5 shadow-sm ring-4 ring-blue-50 dark:border-blue-400 dark:bg-mm-card dark:ring-blue-500/10">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-mm-text">
            {t(`months.${labelOfMonth(current.month)}`)} {current.year}
          </h2>
          <PeriodKindBadge kind={current.kind} />
        </div>

        <div className="flex flex-col gap-2.5">
          <AmountRow
            label={t('reports.comparison.income')}
            value={current.income}
            emphasis
            delta={<DeltaBadge value={deltaVsPrevious.incomeChangeRate} metric="income" />}
          />
          <AmountRow
            label={t('reports.comparison.expense')}
            value={current.expense}
            emphasis
            delta={<DeltaBadge value={deltaVsPrevious.expenseChangeRate} metric="expense" />}
          />
          <AmountRow
            label={t('reports.comparison.netFlow')}
            value={current.net}
            emphasis
            tone="signed"
            divider
            delta={
              <DeltaBadge
                value={deltaVsPrevious.netChangeAmount}
                metric="net"
                format="currency"
              />
            }
          />
        </div>

        {/* Realized / pending split of the month's expense. */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {t('reports.comparison.realized')} {formatTRY(current.realizedExpense)}
            </span>
            <span>
              {t('reports.comparison.pending')} {formatTRY(current.pendingExpense)}
            </span>
          </div>
          <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-mm-bg">
            <span
              className="h-full bg-rose-500 dark:bg-rose-400"
              style={{ width: `${Math.min(100, Math.max(0, realizedShare))}%` }}
            />
            <span className="h-full flex-1 bg-rose-200 dark:bg-rose-500/30" />
          </div>
        </div>
      </section>

      {/* deltaVsNext reads forward (current -> next), so it belongs on the next column. */}
      <SideColumn
        totals={next}
        caption={t('reports.period.next')}
        delta={deltaVsNext}
        onSelect={() => onSelect({ year: next.year, month: next.month })}
      />
    </div>
  )
}

export default PeriodComparisonHero
