import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReceipt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import type { ReportDTOs } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatPercent, formatShortDate, formatTRY } from '@/utils/formatters'

type TopExpensesPanelProps = {
  topExpenses?: ReportDTOs.TopExpensesResponse
  isLoading: boolean
  hasError: boolean
}

export const TopExpensesPanel: React.FC<TopExpensesPanelProps> = ({
  topExpenses,
  isLoading,
  hasError,
}) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en' : 'tr'

  const biggest = topExpenses?.items[0]
  const biggestShare =
    biggest && topExpenses && topExpenses.periodTotal > 0
      ? (biggest.amount / topExpenses.periodTotal) * 100
      : 0

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-mm-border dark:bg-mm-card">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-mm-border">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
          {t('reports.top.title')}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('reports.top.subtitle')}
        </p>
      </header>

      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3, 4].map((index) => (
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
        ) : !topExpenses || topExpenses.items.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-mm-bg dark:text-slate-500">
              <FontAwesomeIcon icon={faReceipt} />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {t('reports.top.empty')}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('reports.top.emptyHint')}
            </p>
          </div>
        ) : (
          <>
            {biggest && (
              <p className="mb-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600 dark:bg-mm-bg dark:text-slate-300">
                {t('reports.top.biggestItem', {
                  name: biggest.name,
                  share: formatPercent(biggestShare),
                })}
              </p>
            )}

            <ul className="flex flex-col">
              {topExpenses.items.map((item, index) => (
                <li
                  key={item.installmentId}
                  className="grid grid-cols-[24px_1fr_auto] items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 dark:border-mm-border"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold tabular-nums ${
                      index === 0
                        ? 'bg-blue-500 text-white dark:bg-blue-400 dark:text-slate-900'
                        : 'bg-slate-100 text-slate-500 dark:bg-mm-bg dark:text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-mm-text">
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-slate-500 dark:text-slate-400">
                      <span>{formatShortDate(item.date, locale)}</span>
                      <span aria-hidden>·</span>
                      <span className="truncate">{item.accountName}</span>
                      {item.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-mm-text">
                      {formatTRY(item.amount)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      {/* Only multi-installment transactions get the n/m badge. */}
                      {item.totalInstallment > 1 &&
                        `${item.installmentNumber}/${item.totalInstallment} · `}
                      {item.paid ? t('reports.top.paid') : t('reports.top.pending')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}

export default TopExpensesPanel
