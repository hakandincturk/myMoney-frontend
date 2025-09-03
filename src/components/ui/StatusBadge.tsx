import React from 'react'
import { useTranslation } from 'react-i18next'
import { TransactionStatus } from '../../enums'

type StatusBadgeProps = {
  status: TransactionStatus
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation()
  
  const getStatusText = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return t('status.pending')
      case TransactionStatus.PARTIAL:
        return t('status.partial')
      case TransactionStatus.PAID:
        return t('status.paid')
      default:
        return String(status)
    }
  }
  
  const getContainerClasses = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PAID:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700'
      case TransactionStatus.PARTIAL:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
      case TransactionStatus.PENDING:
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
    }
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium w-20 ${getContainerClasses(status)} ${className}`}>
      {getStatusText(status)}
    </div>
  )
}

export default StatusBadge
