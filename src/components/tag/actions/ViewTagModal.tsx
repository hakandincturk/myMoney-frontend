import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { TagDTOs } from '@/types/tag'
import { useGetTransactionsByTagQuery } from '@/services/tagApi'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { TagTransactionTable } from '../TagTransactionTable'
import {
  TagTransactionFilterPanel,
  TagTransactionFilters,
} from '../TagTransactionFilterPanel'

type ViewTagModalProps = {
  isOpen: boolean
  onClose: () => void
  tag: TagDTOs.ListItemWithMeta | null
}

export const ViewTagModal: React.FC<ViewTagModalProps> = ({
  isOpen,
  onClose,
  tag,
}) => {
  const { t, i18n } = useTranslation()

  const [pageParams, setPageParams] = useState({
    pageNumber: 0,
    pageSize: 10,
  })

  const [appliedFilters, setAppliedFilters] = useState<TagTransactionFilters>({})
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (appliedFilters.transactionName) count += 1
    if (appliedFilters.accountIds && appliedFilters.accountIds.length > 0) count += 1
    if (appliedFilters.types && appliedFilters.types.length > 0) count += 1
    if (appliedFilters.statuses && appliedFilters.statuses.length > 0) count += 1
    if (typeof appliedFilters.minAmount === 'number') count += 1
    if (typeof appliedFilters.maxAmount === 'number') count += 1
    if (typeof appliedFilters.minInstallmentCount === 'number') count += 1
    if (typeof appliedFilters.maxInstallmentCount === 'number') count += 1
    return count
  }, [appliedFilters])

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    isFetching: transactionsFetching,
  } = useGetTransactionsByTagQuery(
    {
      tagId: tag?.id ?? 0,
      pageData: {
        pageNumber: pageParams.pageNumber,
        pageSize: pageParams.pageSize,
        ...appliedFilters,
      },
    },
    { skip: !isOpen || !tag?.id }
  )

  const transactions = transactionsData?.data?.content ?? []
  const pageData = transactionsData?.data

  const handlePageChange = (newPage: number) => {
    setPageParams((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

  const handleApplyFilters = (filters: TagTransactionFilters) => {
    setAppliedFilters(filters)
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
    setIsFilterPanelOpen(false)
  }

  const handleClearFilters = () => {
    setAppliedFilters({})
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
  }

  const handleRemoveFilterKey = (key: keyof TagTransactionFilters) => {
    setAppliedFilters((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
  }

  const handleRemoveFilterItem = (key: string, value: unknown) => {
    setAppliedFilters((prev) => {
      const arrayKey = key as 'accountIds' | 'types' | 'statuses'
      const current = prev[arrayKey] as unknown[] | undefined
      if (!current) return prev
      const filtered = current.filter((v) => v !== value)
      const next = { ...prev }
      if (filtered.length > 0) {
        ;(next as Record<string, unknown>)[arrayKey] = filtered
      } else {
        delete next[arrayKey]
      }
      return next
    })
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
  }

  const { data: accountsData } = useListMyActiveAccountsQuery(
    { pageNumber: 0, pageSize: 100, columnName: 'name', asc: true },
    { skip: !isOpen }
  )

  const accountIdToName = useMemo(() => {
    const map: Record<number, string> = {}
    for (const account of accountsData?.data?.content ?? []) {
      map[account.id] = account.name
    }
    return map
  }, [accountsData])

  const getTypeLabel = (value: unknown) =>
    t(`transaction.types.${String(value).toLowerCase()}`)

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US'
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalAmount = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.totalAmount, 0)
  }, [transactions])

  const totalPaid = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.paidAmount, 0)
  }, [transactions])

  if (!tag) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('tag.actions.viewTitle')}
      size="xxl"
      containerClassName="h-[85vh]"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
            <h4 className="text-sm font-medium text-slate-500 dark:text-mm-subtleText mb-1">
              {t('tag.fields.name')}
            </h4>
            <div className="text-lg font-semibold text-slate-900 dark:text-mm-text">
              {tag.name}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
              <h4 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText mb-2 uppercase tracking-wide">
                {t('tag.fields.transactionCount')}
              </h4>
              <div className="text-2xl font-bold text-mm-secondary">
                {tag.transactionCount || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
              <h4 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText mb-2 uppercase tracking-wide">
                {t('tag.fields.createdAt')}
              </h4>
              <div className="text-sm font-medium text-slate-900 dark:text-mm-text">
                {formatDate(tag.createdAt)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40">
              <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                {t('transaction.types.debt')}
              </h4>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {transactions.length}
              </div>
            </div>
          </div>
        </div>

        <TagTransactionFilterPanel
          isOpen={isFilterPanelOpen}
          onToggle={() => setIsFilterPanelOpen((prev) => !prev)}
          appliedFilters={appliedFilters}
          activeCount={activeFilterCount}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        <FilterChips
          appliedFilters={appliedFilters}
          onRemoveKey={(key) => handleRemoveFilterKey(key as keyof TagTransactionFilters)}
          onRemoveItem={handleRemoveFilterItem}
          accountIdToName={accountIdToName}
          getTypeLabel={getTypeLabel}
        />

        {(transactionsLoading || transactionsFetching || transactions.length > 0 || activeFilterCount > 0) && (
          <Card
            className="border-slate-200 dark:border-mm-border"
            contentClassName="p-0"
          >
            <div className="h-[45vh] min-h-[320px] overflow-hidden">
              <div className="h-full">
                <TagTransactionTable
                  data={transactions}
                  isLoading={transactionsLoading || transactionsFetching}
                  pageParams={pageParams}
                  totalPages={pageData?.totalPages ?? 0}
                  totalRecords={pageData?.totalElements ?? 0}
                  isFirstPage={pageData?.first}
                  isLastPage={pageData?.last}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>

            {pageData && (
              <div className="p-4 border-t border-slate-100 dark:border-mm-border bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-3 gap-3">
                <div>
                  <h5 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase mb-1">
                    {t('transaction.totalAmount')}
                  </h5>
                  <p className="text-lg font-bold text-slate-900 dark:text-mm-text">
                    ₺{totalAmount.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase mb-1">
                    {t('transaction.paidAmount')}
                  </h5>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ₺{totalPaid.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase mb-1">
                    {t('transaction.remainingAmount')}
                  </h5>
                  <p
                    className={`text-lg font-bold ${
                      totalAmount - totalPaid <= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    ₺
                    {(totalAmount - totalPaid).toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {!transactionsLoading && transactions.length === 0 && activeFilterCount === 0 && (
          <Card
            className="border-slate-200 dark:border-mm-border bg-slate-50/50 dark:bg-slate-800/30"
            contentClassName="py-8 text-center"
          >
            <p className="text-slate-500 dark:text-mm-subtleText">
              {t('messages.noTransactions')}
            </p>
          </Card>
        )}
      </div>
    </Modal>
  )
}

export default ViewTagModal
