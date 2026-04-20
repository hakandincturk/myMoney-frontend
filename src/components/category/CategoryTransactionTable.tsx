import React, { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CategoryDTOs } from '@/types/category'
import { TransactionStatus } from '@/enums/transaction'

type CategoryTransactionTableProps = {
  data: CategoryDTOs.Transaction[]
  isLoading: boolean
  pageParams: {
    pageNumber: number
    pageSize: number
  }
  totalPages: number
  totalRecords: number
  isFirstPage?: boolean
  isLastPage?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const columnHelper = createColumnHelper<CategoryDTOs.Transaction>()

export const CategoryTransactionTable: React.FC<CategoryTransactionTableProps> = ({
  data,
  isLoading,
  pageParams,
  totalPages,
  totalRecords,
  isFirstPage,
  isLastPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t, i18n } = useTranslation()

  const getTransactionTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      DEBT: t('transaction.types.debt', 'Borç'),
      INCOME: t('transaction.types.income', 'Gelir'),
      EXPENSE: t('transaction.types.expense', 'Gider'),
      PAYMENT: t('transaction.types.payment', 'Ödeme'),
      CREDIT: t('transaction.types.credit', 'Kredi'),
    }
    return typeMap[type] || type
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText">
            {t('table.columns.transactionName', 'İşlem Adı')}
          </span>
        ),
        cell: (info) => (
          <span className="font-medium text-slate-900 dark:text-mm-text">
            {info.getValue()}
          </span>
        ),
        meta: { className: 'min-w-[180px]' },
      }),
      columnHelper.accessor('accountName', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText">
            {t('table.columns.account', 'Hesap')}
          </span>
        ),
        cell: (info) => (
          <span className="text-slate-700 dark:text-mm-subtleText">
            {info.getValue()}
          </span>
        ),
        meta: { className: 'min-w-[140px]' },
      }),
      columnHelper.accessor('type', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText">
            {t('table.columns.type', 'Tür')}
          </span>
        ),
        cell: (info) => {
          const type = info.getValue()
          const isIncome = type === 'INCOME'
          const isExpense = type === 'EXPENSE'
          const tonClass = isIncome
            ? 'bg-green-50/60 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700/40'
            : isExpense
              ? 'bg-orange-50/60 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700/40'
              : 'bg-blue-50/60 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/40'

          return (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${tonClass}`}
            >
              {getTransactionTypeText(type)}
            </span>
          )
        },
        meta: { className: 'min-w-[110px]' },
      }),
      columnHelper.accessor('status', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText">
            {t('table.columns.status', 'Durum')}
          </span>
        ),
        cell: (info) => (
          <StatusBadge status={info.getValue() as TransactionStatus} />
        ),
        meta: { className: 'min-w-[110px]' },
      }),
      columnHelper.accessor('totalAmount', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText text-right block">
            {t('table.columns.totalAmount', 'Toplam Tutar')}
          </span>
        ),
        cell: (info) => (
          <span className="text-slate-900 dark:text-mm-text font-medium text-right block">
            ₺{Number(info.getValue()).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
        meta: { className: 'min-w-[120px] text-right' },
      }),
      columnHelper.accessor('paidAmount', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText text-right block">
            {t('table.columns.paidAmount', 'Ödenen Tutar')}
          </span>
        ),
        cell: (info) => {
          const paid = info.getValue()
          const total = info.row.original.totalAmount
          const isPaid = paid >= total

          return (
            <span
              className={`text-right block font-medium ${
                isPaid
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-slate-700 dark:text-mm-subtleText'
              }`}
            >
              ₺{Number(paid).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )
        },
        meta: { className: 'min-w-[120px] text-right' },
      }),
      columnHelper.accessor('totalInstallment', {
        header: () => (
          <span className="font-medium text-slate-600 dark:text-mm-subtleText text-center block">
            {t('table.columns.installments', 'Taksit')}
          </span>
        ),
        cell: (info) => (
          <span className="text-slate-900 dark:text-mm-text font-medium text-center block">
            {info.getValue()}
          </span>
        ),
        meta: { className: 'min-w-[80px] text-center' },
      }),
    ],
    [t]
  )

  if (isLoading) {
    return <TableSkeleton columns={7} rows={5} />
  }

  return (
    <Table
      data={data}
      columns={columns}
      showPagination={true}
      pageSize={pageParams.pageSize}
      currentPage={pageParams.pageNumber}
      totalPages={totalPages}
      totalRecords={totalRecords}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      className="h-full"
    />
  )
}

export default CategoryTransactionTable
