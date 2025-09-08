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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change }) => {
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
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const { t } = useTranslation()

  const formatCurrency = (amount: number) => {
    return `₺${Math.abs(amount).toLocaleString('tr-TR')}`
  }

  const formatPercentage = (rate: number) => {
    return `%${rate.toFixed(1)}`
  }

  const stats = [
    {
      title: t('account.totalBalance'),
      value: formatCurrency(data.totalBalance),
      icon: '💰',
      color: 'green' as const,
      change: {
        value: '%12.5',
        isPositive: true
      }
    },
    {
      title: t('transaction.monthlyIncome'),
      value: formatCurrency(data.monthlyIncome),
      icon: '📈',
      color: 'blue' as const,
      change: {
        value: '%8.2',
        isPositive: true
      }
    },
    {
      title: t('transaction.monthlyExpense'),
      value: formatCurrency(data.monthlyExpense),
      icon: '📉',
      color: 'red' as const,
      change: {
        value: '%3.1',
        isPositive: false
      }
    },
    {
      title: t('transaction.savingsRate'),
      value: formatPercentage(data.savingsRate),
      icon: '🎯',
      color: 'amber' as const,
      change: {
        value: '%2.3',
        isPositive: true
      }
    },
    {
      title: 'Bekleyen Ödemeler',
      value: data.pendingPayments.toString(),
      icon: '⏰',
      color: 'purple' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
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
