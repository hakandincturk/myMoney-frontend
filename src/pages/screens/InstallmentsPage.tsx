import React from 'react'
import { Table } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TransactionStatus } from '@/services/transactionApi'
import { createColumnHelper } from '@tanstack/react-table'

// Mock taksit listesi - gerçek servisler gelene kadar
const MOCK_INSTALLMENTS = [
  { id: 1, debtId: 1, month: '2025-08', amount: 300, status: TransactionStatus.PENDING },
  { id: 2, debtId: 1, month: '2025-09', amount: 300, status: TransactionStatus.PENDING },
  { id: 3, debtId: 2, month: '2025-08', amount: 750, status: TransactionStatus.PAID },
  { id: 4, debtId: 2, month: '2025-09', amount: 750, status: TransactionStatus.PARTIAL },
]

type Installment = {
  id: number
  debtId: number
  month: string
  amount: number
  status: TransactionStatus
}

const columnHelper = createColumnHelper<Installment>()

const columns = [
  columnHelper.accessor('debtId', {
    header: 'Borç ID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('month', {
    header: 'Ay',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('amount', {
    header: 'Tutar',
    cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
  }),
  columnHelper.accessor('status', {
    header: 'Durum',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
]

export const InstallmentsPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">Aylık Taksitler</h2>

        <Table 
          data={MOCK_INSTALLMENTS} 
          columns={columns} 
          title="Taksit Listesi"
          showPagination={MOCK_INSTALLMENTS.length > 10}
          pageSize={10}
        />
      </div>
    </div>
  )
}

export default InstallmentsPage


