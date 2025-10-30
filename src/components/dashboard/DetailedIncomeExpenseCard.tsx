import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowTrendUp, faArrowTrendDown } from '@fortawesome/free-solid-svg-icons'

interface DetailedIncomeExpenseCardProps {
  type: 'income' | 'expense'
  data: {
    occured: number
    waiting: number
    planning: number
    lastMonthChangeRate?: number
  }
  title: string
}

export const DetailedIncomeExpenseCard: React.FC<DetailedIncomeExpenseCardProps> = ({
  type,
  data,
  title
}) => {
  const { t } = useTranslation()
  const [showOccurredHelp, setShowOccurredHelp] = React.useState(false)
  const [showWaitingHelp, setShowWaitingHelp] = React.useState(false)
  const [showPlanningHelp, setShowPlanningHelp] = React.useState(false)
  
  const formatCurrency = (amount: number) => {
    return `₺${Math.abs(amount).toLocaleString('tr-TR')}`
  }

  const total = data.occured + data.waiting + data.planning
  
  const colorClasses = type === 'income' ? {
    primary: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    occuredBar: 'bg-emerald-500',
    waitingBar: 'bg-emerald-300',
    planningBar: 'bg-emerald-200'
  } : {
    primary: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    iconBg: 'bg-rose-100 dark:bg-rose-500/20',
    occuredBar: 'bg-rose-500',
    waitingBar: 'bg-rose-300',
    planningBar: 'bg-rose-200'
  }

  const occuredPercentage = total > 0 ? (data.occured / total) * 100 : 0
  const waitingPercentage = total > 0 ? (data.waiting / total) * 100 : 0
  const planningPercentage = total > 0 ? (data.planning / total) * 100 : 0

  return (
    <Card className={`${colorClasses.bg} border-l-4 ${type === 'income' ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${colorClasses.iconBg} flex items-center justify-center`}>
              <FontAwesomeIcon 
                icon={type === 'income' ? faArrowTrendUp : faArrowTrendDown} 
                className={`text-lg ${colorClasses.primary}`} 
              />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
              <p className={`text-2xl font-bold ${colorClasses.primary}`}>
                {formatCurrency(type === 'expense' ? (data.waiting) : (data.occured))}
              </p>
            </div>
          </div>
          {data.lastMonthChangeRate !== undefined && (
            <div className={`text-sm ${
              type === 'expense'
                ? (data.lastMonthChangeRate >= 0 ? 'text-rose-600' : 'text-emerald-600')
                : (data.lastMonthChangeRate >= 0 ? 'text-emerald-600' : 'text-rose-600')
            }`}>
              {data.lastMonthChangeRate >= 0 ? '↗' : '↘'} %{Math.abs(data.lastMonthChangeRate).toFixed(1)}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div 
              className={`${colorClasses.occuredBar} transition-all duration-500`}
              style={{ width: `${occuredPercentage}%` }}
            />
            <div 
              className={`${colorClasses.waitingBar} transition-all duration-500`}
              style={{ width: `${waitingPercentage}%` }}
            />
            <div 
              className={`${colorClasses.planningBar} transition-all duration-500`}
              style={{ width: `${planningPercentage}%` }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClasses.occuredBar}`} />
            <div>
              <div className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                {t(type === 'expense' ? 'transaction.expenseOccurredAmount' : 'transaction.occurredAmount')}
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowOccurredHelp(true)}
                  onMouseLeave={() => setShowOccurredHelp(false)}
                >
                  <button 
                    type="button" 
                    aria-label="Bilgi"
                    onClick={() => setShowOccurredHelp(v => !v)}
                    className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[8px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    ?
                  </button>
                  {showOccurredHelp && (
                    <div className="absolute z-20 top-4 left-0 min-w-[180px] max-w-xs p-2 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-800 shadow-lg">
                      {t(type === 'expense' ? 'transaction.expenseOccurredTooltip' : 'transaction.occurredAmountTooltip')}
                    </div>
                  )}
                </div>
              </div>
              <div className={`font-semibold ${colorClasses.primary}`}>
                {formatCurrency(data.occured)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClasses.waitingBar}`} />
            <div>
              <div className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                {t(type === 'expense' ? 'transaction.expenseWaitingAmount' : 'transaction.waitingAmount')}
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowWaitingHelp(true)}
                  onMouseLeave={() => setShowWaitingHelp(false)}
                >
                  <button 
                    type="button" 
                    aria-label="Bilgi"
                    onClick={() => setShowWaitingHelp(v => !v)}
                    className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[8px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    ?
                  </button>
                  {showWaitingHelp && (
                    <div className="absolute z-20 top-4 left-1/2 transform -translate-x-1/2 min-w-[180px] max-w-xs p-2 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-800 shadow-lg">
                      {t(type === 'expense' ? 'transaction.expenseWaitingTooltip' : 'transaction.waitingAmountTooltip')}
                    </div>
                  )}
                </div>
              </div>
              <div className={`font-semibold ${colorClasses.primary}`}>
                {formatCurrency(type === 'expense' ? data.planning : data.waiting)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClasses.planningBar}`} />
            <div>
              <div className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                {t(type === 'expense' ? 'transaction.expensePlanningAmount' : 'transaction.planningAmount')}
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowPlanningHelp(true)}
                  onMouseLeave={() => setShowPlanningHelp(false)}
                >
                  <button 
                    type="button" 
                    aria-label="Bilgi"
                    onClick={() => setShowPlanningHelp(v => !v)}
                    className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center text-[8px] hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    ?
                  </button>
                  {showPlanningHelp && (
                    <div className="absolute z-20 top-4 right-0 min-w-[180px] max-w-xs p-2 rounded-md text-[11px] bg-slate-900 text-white dark:bg-slate-800 shadow-lg">
                      {t(type === 'expense' ? 'transaction.expensePlanningTooltip' : 'transaction.planningAmountTooltip')}
                    </div>
                  )}
                </div>
              </div>
              <div className={`font-semibold ${colorClasses.primary}`}>
                {formatCurrency(type === 'expense' ? (data.planning + data.waiting) : data.planning)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DetailedIncomeExpenseCard