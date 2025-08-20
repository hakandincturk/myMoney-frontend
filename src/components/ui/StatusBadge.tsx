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
        return status
    }
  }
  
  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'text-amber-600'
      case TransactionStatus.PARTIAL:
        return 'text-blue-600'
      case TransactionStatus.PAID:
        return 'text-emerald-600'
      default:
        return 'text-gray-600'
    }
  }
  
  const getStatusBackground = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
      case TransactionStatus.PARTIAL:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
      case TransactionStatus.PAID:
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
    }
  }

  return (
    <span className={`inline-block w-20 px-3 py-1.5 rounded-lg text-sm font-medium border-2 text-center ${getStatusColor(status)} ${getStatusBackground(status)} ${className}`}>
      {getStatusText(status)}
    </span>
  )
}

export default StatusBadge
