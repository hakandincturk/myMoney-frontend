import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAuth } from '@/store/slices/authSelectors'
import { authSlice } from '@/store/slices/authSlice'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
)

// Mock veri - gerçek servisler hazır olana kadar
const MOCK_DATA = {
  monthlyIncome: [12000, 15000, 18000, 14000, 16000, 19000, 17000, 20000, 18000, 16000, 14000, 18000],
  monthlyExpense: [8000, 12000, 15000, 11000, 13000, 16000, 14000, 17000, 15000, 13000, 11000, 15000],
  accountDistribution: [
    { name: 'Nakit', balance: 25000, color: '#10B981' },
    { name: 'Banka', balance: 150000, color: '#3B82F6' },
    { name: 'Kredi Kartı', balance: -15000, color: '#EF4444' },
  ],
  recentTransactions: [
    { id: 1, type: 'Gelir', amount: 5000, date: '2025-01-15', description: 'Maaş' },
    { id: 2, type: 'Gider', amount: -1200, date: '2025-01-14', description: 'Market' },
    { id: 3, type: 'Gider', amount: -800, date: '2025-01-13', description: 'Yakıt' },
    { id: 4, type: 'Gelir', amount: 3000, date: '2025-01-12', description: 'Ek İş' },
  ],
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B',
      },
    },
  },
  scales: {
    x: {
      ticks: { color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B' },
      grid: { color: document.documentElement.classList.contains('dark') ? '#334155' : '#E2E8F0' },
    },
    y: {
      ticks: { color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B' },
      grid: { color: document.documentElement.classList.contains('dark') ? '#334155' : '#E2E8F0' },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: document.documentElement.classList.contains('dark') ? '#E2E8F0' : '#1E293B',
        padding: 20,
      },
    },
  },
}

export const HomePage: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full mb-6 bg-slate-50 dark:bg-mm-bg rounded-xl p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text mb-2">
          {t('navigation.home')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-mm-subtleText">
          {t('auth.startFinance')}
        </p>
      </div>

      {/* Özet Kartları */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-mm-secondary/20 flex items-center justify-center mb-2">
                <span className="text-emerald-600 dark:text-mm-secondary text-xl">₺</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-mm-subtleText mb-1">
                {t('account.totalBalance')}
              </h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-mm-secondary">₺160,000</p>
            </div>
          </Card>

          <Card className="text-center hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-mm-primary/20 flex items-center justify-center mb-2">
                <span className="text-blue-600 dark:text-mm-primary text-xl">↑</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-mm-subtleText mb-1">
                {t('transaction.monthlyIncome')}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-mm-primary">₺18,000</p>
            </div>
          </Card>

          <Card className="text-center hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-mm-accent/20 flex items-center justify-center mb-2">
                <span className="text-rose-600 dark:text-mm-accent text-xl">↓</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-mm-subtleText mb-1">
                {t('transaction.monthlyExpense')}
              </h3>
              <p className="text-2xl font-bold text-rose-600 dark:text-mm-accent">₺15,000</p>
            </div>
          </Card>

          <Card className="text-center hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-mm-primary/20 flex items-center justify-center mb-2">
                <span className="text-amber-600 dark:text-mm-primary text-xl">%</span>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-mm-subtleText mb-1">
                {t('transaction.savingsRate')}
              </h3>
              <p className="text-2xl font-bold text-amber-600 dark:text-mm-primary">%16.7</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Grafikler ve Raporlar */}
      <div className="w-full space-y-6">
        {/* Gelir-Gider Trendi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('transaction.incomeExpenseTrend')} className="hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="h-64">
              <Line
                data={{
                  labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
                  datasets: [
                    {
                      label: t('transaction.income'),
                      data: MOCK_DATA.monthlyIncome,
                      borderColor: '#64B5F6',
                      backgroundColor: '#64B5F6',
                      tension: 0.4,
                    },
                    {
                      label: t('transaction.expense'),
                      data: MOCK_DATA.monthlyExpense,
                      borderColor: '#FFB74D',
                      backgroundColor: '#FFB74D',
                      tension: 0.4,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </Card>

          <Card title={t('account.distribution')} className="hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="h-64">
              <Doughnut
                data={{
                  labels: MOCK_DATA.accountDistribution.map(a => a.name),
                  datasets: [
                    {
                      data: MOCK_DATA.accountDistribution.map(a => Math.abs(a.balance)),
                      backgroundColor: MOCK_DATA.accountDistribution.map(a => a.color),
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </div>
          </Card>
        </div>

        {/* Son İşlemler ve Hızlı Erişim */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title={t('transaction.recentTransactions')} className="hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="space-y-3">
              {MOCK_DATA.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-mm-bg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-emerald-100 dark:bg-mm-secondary/20' : 'bg-rose-100 dark:bg-mm-accent/20'
                    }`}>
                      <span className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-emerald-600 dark:text-mm-secondary' : 'text-rose-600 dark:text-mm-accent'
                      }`}>
                        {transaction.amount > 0 ? '↑' : '↓'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-mm-text">{transaction.description}</p>
                      <p className="text-sm text-slate-500 dark:text-mm-subtleText">{transaction.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-600 dark:text-mm-secondary' : 'text-rose-600 dark:text-mm-accent'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₺{Math.abs(transaction.amount).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title={t('common.quickAccess')} className="hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/contacts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-mm-bg hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-mm-primary/20 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-mm-primary text-lg">👥</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-mm-text">{t('navigation.contacts')}</span>
              </Link>
              
              <Link to="/accounts" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-mm-bg hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-mm-secondary/20 flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-mm-secondary text-lg">🏦</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-mm-text">{t('navigation.accounts')}</span>
              </Link>
              
              <Link to="/debts/overview" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-mm-bg hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-colors">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-mm-accent/20 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-mm-accent text-lg">➕</span>
                </div>
                <span className="text-slate-900 dark:text-mm-text font-medium">{t('transaction.newDebt')}</span>
              </Link>
              
              <Link to="/debts/overview" className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-mm-bg hover:bg-slate-100 dark:hover:bg-mm-cardHover transition-colors">
                <div className="w-10 h-12 rounded-lg bg-purple-100 dark:bg-mm-primary/20 flex items-center justify-center">
                  <span className="text-purple-600 dark:text-mm-primary text-lg">📊</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-mm-text">{t('navigation.debts')}</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HomePage


