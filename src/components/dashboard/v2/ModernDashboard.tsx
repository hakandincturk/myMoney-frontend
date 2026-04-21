import React, { Suspense, lazy, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetQuickViewQuery,
  useGetMonthlyTrendQuery,
  useGetLastTransactionsQuery,
  useGetIncomingTransactionsQuery,
} from '@/services/dashboardApi'
import { DateUtils } from '../../../utils/chartUtils'
import HeroCard from './HeroCard'
import InsightsStrip from './InsightsStrip'
import FlowCards from './FlowCards'
import ActivityFeed from './ActivityFeed'
import UpcomingList from './UpcomingList'
import QuickTransactionModals from './QuickTransactionModals'
import { useQuickTransactionActions } from './useQuickTransactionActions'

// Lazy-loaded heavy chart bundle — charts rely on chart.js which we keep out of the
// initial paint of the dashboard.
const ChartsSection = lazy(() => import('./ChartsSection'))

type ModernDashboardProps = {
  className?: string
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ className = '' }) => {
  const { t } = useTranslation()

  const {
    data: quickView,
    isFetching: quickViewFetching,
    error: quickViewError,
  } = useGetQuickViewQuery()

  const {
    data: monthlyTrend,
    isFetching: monthlyTrendFetching,
    error: monthlyTrendError,
  } = useGetMonthlyTrendQuery()

  const {
    data: lastTransactions,
    isFetching: lastTransactionsFetching,
    error: lastTransactionsError,
  } = useGetLastTransactionsQuery()

  const {
    data: incomingTransactions,
    isFetching: incomingFetching,
    error: incomingError,
  } = useGetIncomingTransactionsQuery()

  const isQuickViewSuccess = quickView?.type === true
  const isMonthlyTrendSuccess = monthlyTrend?.type === true

  const translatedMonthlyData = useMemo(() => {
    if (!isMonthlyTrendSuccess || !monthlyTrend?.data?.monthlyTrendData) return []
    return monthlyTrend.data.monthlyTrendData.map((item) => ({
      ...item,
      title: DateUtils.translateMonthName(item.title, t),
    }))
  }, [monthlyTrend, isMonthlyTrendSuccess, t])

  const quickActionsController = useQuickTransactionActions()

  return (
    <div
      className={`w-full bg-gradient-to-b from-slate-50 via-slate-50 to-white px-4 pb-10 pt-6 dark:from-mm-bg dark:via-mm-bg dark:to-mm-bg sm:px-6 md:px-8 ${className}`}
    >
      <div className="flex w-full flex-col gap-6">
        <HeroCard
          quickView={quickView?.data}
          isLoading={quickViewFetching}
          hasError={!!quickViewError || !isQuickViewSuccess}
          onQuickAction={quickActionsController.openModal}
        />

        <InsightsStrip
          quickView={quickView?.data}
          isLoading={quickViewFetching}
          hasError={!!quickViewError || !isQuickViewSuccess}
        />

        <FlowCards
          quickView={quickView?.data}
          isLoading={quickViewFetching}
          hasError={!!quickViewError || !isQuickViewSuccess}
        />

        <Suspense
          fallback={
            <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 dark:border-mm-border dark:bg-mm-card dark:text-slate-400">
              {t('dashboard.chartsDataLoading')}
            </div>
          }
        >
          <ChartsSection
            monthlyData={translatedMonthlyData}
            isMonthlyLoading={monthlyTrendFetching}
            hasMonthlyError={!!monthlyTrendError || !isMonthlyTrendSuccess}
          />
        </Suspense>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="min-h-[420px]">
            <ActivityFeed
              lastTransactions={lastTransactions?.data}
              isLoading={lastTransactionsFetching}
              hasError={!!lastTransactionsError}
            />
          </div>
          <div className="min-h-[420px]">
            <UpcomingList
              incoming={incomingTransactions?.data}
              isLoading={incomingFetching}
              hasError={!!incomingError}
            />
          </div>
        </div>
      </div>

      <QuickTransactionModals controller={quickActionsController} />
    </div>
  )
}

export default ModernDashboard
