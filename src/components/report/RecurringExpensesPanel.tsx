import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { RecurringKind } from '@/enums'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPercent, formatShortDate, formatTRY } from '@/utils/formatters'
import Sparkline from './Sparkline'
import { labelOfMonth } from './periodUtils'

type RecurringExpensesPanelProps = {
  recurring?: ReportDTOs.RecurringResponse
  isLoading: boolean
  hasError: boolean
}

const KIND_CLASSES: Record<RecurringKind, string> = {
  [RecurringKind.INSTALLMENT]: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  [RecurringKind.REPEATED]: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
}

export const RecurringExpensesPanel: React.FC<RecurringExpensesPanelProps> = ({
  recurring,
  isLoading,
  hasError,
}) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en' : 'tr'

  // This panel is NOT tied to the month picker — the endpoint always looks back from
  // today. Spelling the window out keeps that independence visible instead of hidden.
  const windowLabel = recurring
    ? `${t(`months.${labelOfMonth(recurring.windowStart.month)}`)} ${recurring.windowStart.year} – ${t(
        `months.${labelOfMonth(recurring.windowEnd.month)}`,
      )} ${recurring.windowEnd.year}`
    : ''

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.recurring.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {windowLabel || t('reports.recurring.subtitle')}
        </p>
      </header>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
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
        ) : !recurring || recurring.items.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faRotate} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.recurring.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('reports.recurring.emptyHint')}
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col">
              {recurring.items.map((item) => (
                <li
                  key={item.groupKey}
                  className={`grid grid-cols-[1fr_auto] items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0 dark:border-mm-border sm:grid-cols-[1fr_auto_92px] ${
                    item.active ? '' : 'opacity-60'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-mm-text">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${KIND_CLASSES[item.kind]}`}
                      >
                        {item.kind === RecurringKind.INSTALLMENT
                          ? t('reports.recurring.installment')
                          : t('reports.recurring.repeated')}
                      </span>
                      <span>{t('reports.recurring.months', { count: item.monthsSpan })}</span>
                      {item.nextExpectedDate && (
                        <span
                          title={
                            item.kind === RecurringKind.REPEATED
                              ? t('reports.recurring.estimatedHint')
                              : undefined
                          }
                        >
                          {/* REPEATED dates are estimates, marked with a leading tilde. */}
                          {item.kind === RecurringKind.REPEATED ? '~' : ''}
                          {t('reports.recurring.next', {
                            date: formatShortDate(item.nextExpectedDate, locale),
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[13px] font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                      {formatTRY(item.averageAmount)}
                    </p>
                    <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                      {t('reports.recurring.perMonth')}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <Sparkline
                      values={item.amountByMonth.map((entry) => entry.amount)}
                      className={
                        item.kind === RecurringKind.INSTALLMENT
                          ? 'stroke-amber-500 dark:stroke-amber-400'
                          : 'stroke-blue-500 dark:stroke-blue-400'
                      }
                      ariaLabel={t('reports.recurring.sparklineLabel', { name: item.name })}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-slate-200 pt-3 dark:border-mm-border">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('reports.recurring.fixedCost')}
                </p>
                <p className="mt-0.5 text-[11.5px] text-slate-500 dark:text-slate-400">
                  {t('reports.recurring.fixedCostHint', {
                    share: formatPercent(recurring.fixedCostShareOfIncome),
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                  {formatTRY(recurring.monthlyFixedCost)}
                </p>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                  {t('reports.recurring.perMonth')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default RecurringExpensesPanel
