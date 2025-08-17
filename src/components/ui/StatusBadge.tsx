import React from 'react'
import { TransactionStatus } from '../../enums'
import { TransactionHelpers } from '../../types'

type StatusBadgeProps = {
  status: TransactionStatus
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span className={`inline-block w-20 px-3 py-1.5 rounded-lg text-sm font-medium border-2 text-center ${TransactionHelpers.getStatusColor(status)} ${TransactionHelpers.getStatusBackground(status)} ${className}`}>
      {TransactionHelpers.getStatusText(status)}
    </span>
  )
}

export default StatusBadge
