import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  title: string
  value: string
  icon: string
  color: 'green' | 'blue' | 'red' | 'amber' | 'purple'
  change?: {
    value: string
    isPositive: boolean
  }
  subtitle?: string
  subtitleHelp?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, subtitle, subtitleHelp }) => {
  const colorClasses = {
    green: {
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      value: 'text-emerald-600 dark:text-emerald-400'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      value: 'text-blue-600 dark:text-blue-400'
    },
    red: {
      bg: 'bg-rose-100 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      value: 'text-rose-600 dark:text-rose-400'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      value: 'text-amber-600 dark:text-amber-400'
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      value: 'text-purple-600 dark:text-purple-400'
    }
  }

  const classes = colorClasses[color]
  const [showHelp, setShowHelp] = React.useState(false)

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full ${classes.bg} flex items-center justify-center`}>
              <span className={`text-xl ${classes.text}`}>{icon}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {title}
            </h3>
          </div>
          <p className={`text-2xl font-bold ${classes.value}`}>{value}</p>
          {subtitle && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span>{subtitle}</span>
              {subtitleHelp && (
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowHelp(true)}
                  onMouseLeave={() => setShowHelp(false)}
                >
                  <button 
                    type="button" 
                    aria-label="Bilgi"
                    onClick={() => setShowHelp(v => !v)}
                    className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[10px] hover:bg-slate-100 dark:hover:bg-slate-700"
                    title={subtitleHelp}
                  >
                    ?
                  </button>
                  {showHelp && (
                    <div className="absolute z-20 top-5 left-0 min-w-[200px] max-w-xs p-2 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-800 shadow-lg">
                      {subtitleHelp}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm ${change.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {change.isPositive ? '↗' : '↘'} {change.value}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                geçen aya göre
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

interface DashboardStatsProps {
  data: {
    totalBalance: number
    monthlyIncome: number
    monthlyExpense: number
    savingsRate: number
    pendingPayments: number
  }
  changes?: {
    incomeChangeRate?: number
    expenseChangeRate?: number
    totalBalanceChangeRate?: number
    savingsRateChangeRate?: number
  }
  details?: {
    income?: { occured: number; waiting: number }
    expense?: { occured: number; waiting: number }
  }
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data, changes, details }) => {
  const { t } = useTranslation()

  const formatCurrency = (amount: number) => {
    return `₺${Math.abs(amount).toLocaleString('tr-TR')}`
  }

  const formatPercentage = (rate: number) => {
    return `%${rate.toFixed(1)}`
  }

  const toChange = (rate?: number) => {
    if (rate === undefined || rate === null) return undefined
    const isPositive = rate >= 0
    const formatted = `%${Math.abs(rate).toFixed(1)}`
    return { value: formatted, isPositive }
  }

  const incomeOccured = details?.income?.occured
  const incomeWaiting = details?.income?.waiting
  const incomeTotal =
    typeof incomeOccured === 'number' && typeof incomeWaiting === 'number'
      ? incomeOccured + incomeWaiting
      : undefined

  const expenseOccured = details?.expense?.occured
  const expenseWaiting = details?.expense?.waiting
  const expenseTotal =
    typeof expenseOccured === 'number' && typeof expenseWaiting === 'number'
      ? expenseOccured + expenseWaiting
      : undefined

  const stats = [
    {
      title: t('account.totalBalance'),
      value: formatCurrency(data.totalBalance),
      icon: '💰',
      color: 'green' as const,
      change: toChange(changes?.totalBalanceChangeRate),
      subtitle: undefined,
      subtitleHelp: undefined
    },
    {
      title: t('transaction.monthlyIncome'),
      value: formatCurrency(incomeTotal ?? data.monthlyIncome),
      icon: '📈',
      color: 'blue' as const,
      subtitle:
        typeof incomeOccured === 'number' && typeof incomeTotal === 'number' && incomeTotal !== incomeOccured
          ? `${formatCurrency(incomeOccured)} / ${formatCurrency(incomeTotal)}`
          : undefined,
			subtitleHelp: 'Gerçekleşen Tutar / Toplam Tutar',
      change: toChange(changes?.incomeChangeRate)
    },
    {
      title: t('transaction.monthlyExpense'),
      value: formatCurrency(data.monthlyExpense ?? expenseTotal),
      icon: '📉',
      color: 'red' as const,
      subtitle:
        typeof expenseOccured === 'number' && typeof expenseTotal === 'number' && expenseTotal !== expenseOccured
          ? `${formatCurrency(expenseOccured)} / ${formatCurrency(expenseTotal)}`
          : undefined,
      subtitleHelp: 'Gerçekleşen Tutar / Toplam Tutar',
      change: toChange(changes?.expenseChangeRate)
    },
    {
      title: t('transaction.savingsRate'),
      value: formatPercentage(data.savingsRate),
      icon: '🎯',
      color: 'amber' as const,
      subtitle: undefined,
      subtitleHelp: 'Tasarruf oranı = (Gelir - Gider) / Gelir',
      change: toChange(changes?.savingsRateChangeRate)
    },
    {
      title: 'Bekleyen Ödemeler',
      value: data.pendingPayments.toString(),
      icon: '⏰',
      color: 'purple' as const,
      subtitle: undefined,
      subtitleHelp: 'Bu ay içinde planlanmış ve henüz ödenmemiş taksit/fatura sayısı.'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
					subtitle={stat.subtitle}
					subtitleHelp={stat.subtitleHelp}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
        />
      ))}
    </div>
  )
}

export default DashboardStats
