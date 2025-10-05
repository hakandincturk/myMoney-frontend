import React from 'react'
import { useTranslation } from 'react-i18next'
import DashboardStats from './DashboardStats'
import { Suspense, lazy } from 'react'
const DashboardCharts = lazy(() => import('./DashboardCharts'))
import DashboardTables from './DashboardTables'
import QuickActions from './QuickActions'
import { useGetQuickViewQuery } from '@/services/dashboardApi'

// Mock veriler - gerçek API entegrasyonu için bu veriler API'den gelecek
const MOCK_DASHBOARD_DATA = {
  stats: {
    totalBalance: 185000,
    monthlyIncome: 22000,
    monthlyExpense: 16500,
    savingsRate: 25.0,
    pendingPayments: 7
  },
  monthlyData: {
    months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    income: [18000, 19500, 22000, 20000, 21000, 23000, 22500, 24000, 22000, 20500, 19000, 22000],
    expense: [14000, 15500, 16500, 15000, 16000, 17500, 16800, 18000, 16500, 15800, 14500, 16500]
  },
  expenseCategories: [
    { name: 'Gıda & Market', amount: 4500, color: '#EF4444', percentage: 27.3 },
    { name: 'Ulaşım', amount: 2800, color: '#F59E0B', percentage: 17.0 },
    { name: 'Faturalar', amount: 3200, color: '#3B82F6', percentage: 19.4 },
    { name: 'Eğlence', amount: 2100, color: '#10B981', percentage: 12.7 },
    { name: 'Sağlık', amount: 1800, color: '#8B5CF6', percentage: 10.9 },
    { name: 'Giyim', amount: 1200, color: '#F97316', percentage: 7.3 },
    { name: 'Diğer', amount: 900, color: '#6B7280', percentage: 5.5 }
  ],
  recentTransactions: [
    {
      id: 1,
      type: 'income' as const,
      amount: 5500,
      date: '2025-01-15',
      description: 'Maaş Ödemesi',
      category: 'Gelir',
      contact: 'ABC Şirketi'
    },
    {
      id: 2,
      type: 'expense' as const,
      amount: 1350,
      date: '2025-01-14',
      description: 'Market Alışverişi',
      category: 'Gıda',
      contact: 'Migros'
    },
    {
      id: 3,
      type: 'expense' as const,
      amount: 850,
      date: '2025-01-13',
      description: 'Yakıt',
      category: 'Ulaşım',
      contact: 'Shell'
    },
    {
      id: 4,
      type: 'income' as const,
      amount: 2200,
      date: '2025-01-12',
      description: 'Freelance Projesi',
      category: 'Ek Gelir',
      contact: 'XYZ Müşteri'
    },
    {
      id: 5,
      type: 'expense' as const,
      amount: 450,
      date: '2025-01-11',
      description: 'Elektrik Faturası',
      category: 'Faturalar',
      contact: 'TEDAŞ'
    }
  ],
  pendingPayments: [
    {
      id: 1,
      title: 'Kredi Kartı Taksidi',
      amount: 2500,
      dueDate: '2025-01-20',
      type: 'installment' as const,
      contact: 'Garanti BBVA',
      status: 'upcoming' as const
    },
    {
      id: 2,
      title: 'İnternet Faturası',
      amount: 89,
      dueDate: '2025-01-18',
      type: 'bill' as const,
      contact: 'Türk Telekom',
      status: 'upcoming' as const
    },
    {
      id: 3,
      title: 'Kira Ödemesi',
      amount: 4500,
      dueDate: '2025-01-25',
      type: 'debt' as const,
      contact: 'Emlak Sahibi',
      status: 'pending' as const
    },
    {
      id: 4,
      title: 'Araba Taksidi',
      amount: 1800,
      dueDate: '2025-01-16',
      type: 'installment' as const,
      contact: 'Yapı Kredi',
      status: 'overdue' as const
    },
    {
      id: 5,
      title: 'Telefon Faturası',
      amount: 125,
      dueDate: '2025-01-22',
      type: 'bill' as const,
      contact: 'Vodafone',
      status: 'upcoming' as const
    }
  ]
}

interface DashboardProps {
  className?: string
}

export const Dashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const { t } = useTranslation()
  const { data: quickView, isFetching } = useGetQuickViewQuery()

  return (
    <div className={`min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 ${className}`}>
      {/* Hızlı İşlemler - Üst Bölüm */}
      <QuickActions className="mb-6" />

      {/* İstatistik Kartları */}
      <DashboardStats 
        data={{
          totalBalance: quickView?.data.totalBalance ?? MOCK_DASHBOARD_DATA.stats.totalBalance,
          monthlyIncome: (quickView?.data.income.occured ?? 0) + (quickView?.data.income.waiting ?? 0) || MOCK_DASHBOARD_DATA.stats.monthlyIncome,
          monthlyExpense: (quickView?.data.expense.waiting ?? 0) || MOCK_DASHBOARD_DATA.stats.monthlyExpense,
          savingsRate: quickView?.data.savingRate ?? MOCK_DASHBOARD_DATA.stats.savingsRate,
          pendingPayments: quickView?.data.waitingInstallments ?? MOCK_DASHBOARD_DATA.stats.pendingPayments,
        }}
        changes={{
          incomeChangeRate: quickView?.data.income.lastMonthChangeRate,
          expenseChangeRate: quickView?.data.expense.lastMonthChangeRate,
          totalBalanceChangeRate: undefined,
          savingsRateChangeRate: quickView?.data.savingRate,
        }}
        details={{
          income: {
            occured: quickView?.data.income.occured ?? undefined as any,
            waiting: quickView?.data.income.waiting ?? undefined as any,
          },
          expense: {
            occured: quickView?.data.expense.occured ?? undefined as any,
            waiting: quickView?.data.expense.waiting ?? undefined as any,
          }
        }}
      />

      {/* Grafikler */}
      <Suspense fallback={<div className="h-80 flex items-center justify-center">Grafikler yükleniyor…</div>}>
        <DashboardCharts 
          monthlyData={MOCK_DASHBOARD_DATA.monthlyData}
          expenseCategories={MOCK_DASHBOARD_DATA.expenseCategories}
        />
      </Suspense>

      {/* Tablolar */}
      <DashboardTables 
        recentTransactions={MOCK_DASHBOARD_DATA.recentTransactions}
        pendingPayments={MOCK_DASHBOARD_DATA.pendingPayments}
      />

    </div>
  )
}

export default Dashboard
