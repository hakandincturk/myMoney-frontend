import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendUp, faArrowTrendDown, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import type { DashboardDTOs } from '@/types/dashboard'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTRY, formatCompactTRY } from './formatters'
import CommandBar from './CommandBar'
import type { QuickActionKind } from './useQuickTransactionActions'

type HeroCardProps = {
  quickView?: DashboardDTOs.QuickViewResponseDto
  isLoading: boolean
  hasError: boolean
  onQuickAction: (kind: QuickActionKind) => void
}

const greetingKey = (hour: number): string => {
  if (hour < 6) return 'dashboard.v2.greeting.night'
  if (hour < 12) return 'dashboard.v2.greeting.morning'
  if (hour < 18) return 'dashboard.v2.greeting.afternoon'
  if (hour < 22) return 'dashboard.v2.greeting.evening'
  return 'dashboard.v2.greeting.night'
}

// Percentage of the way through the current calendar month.
const getMonthProgress = (): number => {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return Math.round(((now.getDate() - 1) / daysInMonth) * 100)
}

export const HeroCard: React.FC<HeroCardProps> = ({
  quickView,
  isLoading,
  hasError,
  onQuickAction,
}) => {
  const { t } = useTranslation()

  const monthProgress = useMemo(() => getMonthProgress(), [])
  const greeting = useMemo(() => t(greetingKey(new Date().getHours())), [t])

  const netFlow = useMemo(() => {
    if (!quickView) return 0
    return (quickView.income?.occured ?? 0) - (quickView.expense?.occured ?? 0)
  }, [quickView])

  const statusMessage = useMemo(() => {
    if (!quickView) return ''
    const incomeOccured = quickView.income?.occured ?? 0
    const expenseOccured = quickView.expense?.occured ?? 0
    if (incomeOccured === 0 && expenseOccured === 0) return t('dashboard.v2.hero.noData')
    if (netFlow > 0) return t('dashboard.v2.hero.surplus', { amount: formatTRY(netFlow) })
    if (netFlow < 0) return t('dashboard.v2.hero.deficit', { amount: formatTRY(Math.abs(netFlow)) })
    return t('dashboard.v2.hero.breakEven')
  }, [quickView, netFlow, t])

  const netIsPositive = netFlow >= 0

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/60 p-6 shadow-sm dark:border-mm-border dark:from-mm-card dark:via-mm-card dark:to-blue-950/40">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10"
      />

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
        {/* Left — greeting + balance */}
        <div className="flex flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {greeting}, {t('dashboard.v2.hero.welcome')} 👋
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-mm-text sm:text-3xl">
                {t('dashboard.v2.hero.monthInBrief')}
              </h1>
            </div>
            <Link
              to="/old/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 backdrop-blur hover:bg-white hover:text-slate-900 dark:bg-mm-bg/50 dark:text-slate-300 dark:ring-mm-border dark:hover:bg-mm-bg dark:hover:text-mm-text"
              title={t('dashboard.v2.hero.viewOld')}
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="text-[11px]" />
              {t('dashboard.v2.hero.viewOld')}
            </Link>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.v2.hero.netBalance')}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-10 w-56" />
            ) : hasError ? (
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                {t('dashboard.v2.errors.loadFailed')}
              </p>
            ) : (
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-mm-text sm:text-5xl">
                  {formatTRY(quickView?.totalBalance ?? 0)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                    netIsPositive
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30'
                      : 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30'
                  }`}
                  title={t('dashboard.v2.insights.netFlowHint')}
                >
                  <FontAwesomeIcon icon={netIsPositive ? faArrowTrendUp : faArrowTrendDown} />
                  {formatCompactTRY(netFlow)}
                </span>
              </div>
            )}
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {isLoading ? (
                <Skeleton className="h-4 w-72" />
              ) : hasError ? null : (
                statusMessage
              )}
            </p>
          </div>

          {/* Month progress */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{t('dashboard.v2.hero.progress')}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">%{monthProgress}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-mm-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${monthProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right — command bar */}
        <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur dark:border-mm-border dark:bg-mm-bg/40">
          <CommandBar onAction={onQuickAction} />
        </div>
      </div>
    </section>
  )
}

export default HeroCard
