import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardStats from './DashboardStats'
import { Suspense, lazy } from 'react'
const DashboardCharts = lazy(() => import('./DashboardCharts'))
import DashboardTables from './DashboardTables'
import QuickActions from './QuickActions'
import DetailedIncomeExpenseCard from './DetailedIncomeExpenseCard'
import { useGetQuickViewQuery, useGetMonthlyTrendQuery, useGetLastTransactionsQuery, useGetIncomingTransactionsQuery } from '@/services/dashboardApi'
import { Skeleton } from '@/components/ui/Skeleton'
import { DateUtils } from '../../utils/chartUtils'

interface DashboardProps {
  className?: string
}

export const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const { t } = useTranslation()
  const { 
    data: quickView, 
    isFetching: isQuickViewFetching, 
    error: quickViewError 
  } = useGetQuickViewQuery()
  
  const { 
    data: monthlyTrend, 
    isFetching: isFetchingMonthlyTrend, 
    error: monthlyTrendError 
  } = useGetMonthlyTrendQuery()

  const {
    data: lastTransactions,
    isFetching: isFetchingLastTransactions,
    error: lastTransactionsError
  } = useGetLastTransactionsQuery()

  const {
    data: incomingTransactions,
    isFetching: isFetchingIncomingTransactions,
    error: incomingTransactionsError
  } = useGetIncomingTransactionsQuery()

  // API response'larının başarılı olup olmadığını kontrol et
  const isQuickViewSuccess = quickView?.type === true
  const isMonthlyTrendSuccess = monthlyTrend?.type === true

  // Monthly trend verilerini ay isimlerini çevirerek transform et
  const translatedMonthlyData = useMemo(() => {
    if (!isMonthlyTrendSuccess || !monthlyTrend?.data?.monthlyTrendData) {
      return []
    }
    
    return monthlyTrend.data.monthlyTrendData.map(item => ({
      ...item,
      title: DateUtils.translateMonthName(item.title, t)
    }))
  }, [monthlyTrend, isMonthlyTrendSuccess, t])

  // Son işlemleri transform et
  const transformedRecentTransactions = useMemo(() => {
    if (!lastTransactions?.data?.lastTransactionData) {
      return []
    }

    return lastTransactions.data.lastTransactionData.map((item, index) => {
      // DEBT ve PAYMENT -> expense, CREDIT ve COLLECTION -> income
      const isIncome = item.type === 'CREDIT' || item.type === 'COLLECTION'
      
      return {
        id: index,
        type: isIncome ? 'income' as const : 'expense' as const,
        amount: item.totalAmount,
        date: item.createdAt,
        description: item.name,
        category: item.description,
      }
    })
  }, [lastTransactions])

  // Yaklaşan ödemeleri transform et
  const transformedPendingPayments = useMemo(() => {
    if (!incomingTransactions?.data?.incomingInstallmentsDatas) {
      return []
    }

    return incomingTransactions.data.incomingInstallmentsDatas.map((item, index) => ({
      id: index,
      title: item.transaction.name,
      amount: item.amount,
      dueDate: item.debtDate,
      type: 'installment' as const,
      contact: item.transaction.description,
      status: 'pending' as const,
      installmentNumber: item.installmentNumber,
      totalInstallment: item.totalInstallment
    }))
  }, [incomingTransactions])

  return (
    <div className={`w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 ${className}`}>
      {/* Hızlı İşlemler - Üst Bölüm */}
      <QuickActions className="mb-6" />

      {/* İstatistik Kartları */}
      {isQuickViewFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : quickViewError || !isQuickViewSuccess ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center mb-6">
          <div className="text-slate-500 dark:text-slate-400">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-sm">{t('dashboard.statisticsLoadError')}</p>
            <p className="text-xs mt-2">{t('dashboard.pleaseRefresh')}</p>
          </div>
        </div>
      ) : (
        <DashboardStats 
          data={{
            totalBalance: quickView?.data?.totalBalance ?? 0,
            monthlyIncome: 0, // Artık kullanılmıyor
            monthlyExpense: 0, // Artık kullanılmıyor
            savingsRate: quickView?.data?.savingRate ?? 0,
            pendingPayments: quickView?.data?.waitingInstallments ?? 0,
          }}
          changes={{
            totalBalanceChangeRate: undefined,
            savingsRateChangeRate: undefined,
          }}
        />
      )}

      {/* Detaylı Gelir/Gider Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isQuickViewFetching ? (
          <>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </>
        ) : quickViewError || !isQuickViewSuccess ? (
          <>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center">
              <div className="text-slate-500 dark:text-slate-400">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm">{t('dashboard.incomeDataLoadError')}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm text-center">
              <div className="text-slate-500 dark:text-slate-400">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-sm">{t('dashboard.expenseDataLoadError')}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <DetailedIncomeExpenseCard
              type="income"
              title={t('transaction.monthlyIncome')}
              data={{
                occured: quickView?.data?.income?.occured ?? 0,
                waiting: quickView?.data?.income?.waiting ?? 0,
                lastMonthChangeRate: quickView?.data?.income?.lastMonthChangeRate
              }}
            />
            <DetailedIncomeExpenseCard
              type="expense"
              title={t('transaction.monthlyExpense')}
              data={{
                occured: quickView?.data?.expense?.occured ?? 0,
                waiting: quickView?.data?.expense?.waiting ?? 0,
                lastMonthChangeRate: quickView?.data?.expense?.lastMonthChangeRate
              }}
            />
          </>
        )}
      </div>

      {/* Grafikler */}
      <Suspense fallback={<div className="h-80 flex items-center justify-center">Grafikler yükleniyor…</div>}>
        <DashboardCharts 
          monthlyData={translatedMonthlyData}
          isMonthlyLoading={isFetchingMonthlyTrend}
          hasMonthlyError={!!monthlyTrendError || !isMonthlyTrendSuccess}
        />
      </Suspense>

      {/* Tablolar - Bunlar da ayrı API'lerden gelecek */}
      <DashboardTables 
        recentTransactions={transformedRecentTransactions}
        pendingPayments={transformedPendingPayments}
      />

    </div>
  )
}

export default Dashboard
