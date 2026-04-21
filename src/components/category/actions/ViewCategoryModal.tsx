import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { CategoryDTOs } from '@/types/category'
import { useGetTransactionsByCategoryQuery } from '@/services/categoryApi'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { CategoryTransactionTable } from '../CategoryTransactionTable'
import {
  CategoryTransactionFilterPanel,
  CategoryTransactionFilters,
} from '../CategoryTransactionFilterPanel'

type ViewCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  category: CategoryDTOs.ListItemWithMeta | null
}

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { t, i18n } = useTranslation()

  const [pageParams, setPageParams] = useState({
    pageNumber: 0,
    pageSize: 10,
  })

  const [appliedFilters, setAppliedFilters] = useState<CategoryTransactionFilters>({})
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
  } = useGetTransactionsByCategoryQuery(
    {
      categoryId: category?.id ?? 0,
      pageData: {
        pageNumber: pageParams.pageNumber,
        pageSize: pageParams.pageSize,
        ...appliedFilters,
      },
    },
    { skip: !isOpen || !category?.id }
  )

  const transactions = transactionsData?.data?.content ?? []
  const pageData = transactionsData?.data

  const handlePageChange = (newPage: number) => {
    setPageParams((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

  const handleApplyFilters = (filters: CategoryTransactionFilters) => {
    setAppliedFilters(filters)
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
    setIsFilterPanelOpen(false)
  }

  const handleClearFilters = () => {
    setAppliedFilters({})
    setPageParams((prev) => ({ ...prev, pageNumber: 0 }))
  }

  const handleRemoveFilterKey = (key: keyof CategoryTransactionFilters) => {
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

  // Account names are needed for chip labels; loaded at modal level so
  // the cache is shared with the filter panel's account-select query.
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

  if (!category) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('category.actions.viewTitle', 'Kategori Detayları')}
      size="xxl"
      containerClassName="h-[85vh]"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" onClick={onClose}>
            {t('common.close', 'Kapat')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Kategori Bilgileri */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
            <h4 className="text-sm font-medium text-slate-500 dark:text-mm-subtleText mb-1">
              {t('category.fields.name', 'Kategori Adı')}
            </h4>
            <div className="text-lg font-semibold text-slate-900 dark:text-mm-text">
              {category.name}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
              <h4 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText mb-2 uppercase tracking-wide">
                {t('category.fields.transactionCount', 'İşlem Sayısı')}
              </h4>
              <div className="text-2xl font-bold text-mm-secondary">
                {category.transactionCount || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
              <h4 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText mb-2 uppercase tracking-wide">
                {t('category.fields.createdAt', 'Oluşturulma')}
              </h4>
              <div className="text-sm font-medium text-slate-900 dark:text-mm-text">
                {formatDate(category.createdAt)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40">
              <h4 className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
                {t('transaction.types.debt', 'İşlem Sayısı')}
              </h4>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {transactions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtre Paneli */}
        <CategoryTransactionFilterPanel
          isOpen={isFilterPanelOpen}
          onToggle={() => setIsFilterPanelOpen((prev) => !prev)}
          appliedFilters={appliedFilters}
          activeCount={activeFilterCount}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {/* Aktif Filtre Chip'leri */}
        <FilterChips
          appliedFilters={appliedFilters}
          onRemoveKey={(key) => handleRemoveFilterKey(key as keyof CategoryTransactionFilters)}
          onRemoveItem={handleRemoveFilterItem}
          accountIdToName={accountIdToName}
          getTypeLabel={getTypeLabel}
        />

        {/* İşlemler Tablosu */}
        {(transactionsLoading || transactionsFetching || transactions.length > 0 || activeFilterCount > 0) && (
          <Card
            className="border-slate-200 dark:border-mm-border"
            contentClassName="p-0"
          >
            <div className="h-[45vh] min-h-[320px] overflow-hidden">
              <div className="h-full">
                <CategoryTransactionTable
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

            {/* İşlem Özeti */}
            {pageData && (
              <div className="p-4 border-t border-slate-100 dark:border-mm-border bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-3 gap-3">
                <div>
                  <h5 className="text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase mb-1">
                    {t('transaction.totalAmount', 'Toplam İşlem')}
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
                    {t('transaction.paidAmount', 'Ödenen Toplam')}
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
                    {t('transaction.remainingAmount', 'Kalan Tutar')}
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

        {/* Boş Durum */}
        {!transactionsLoading && transactions.length === 0 && activeFilterCount === 0 && (
          <Card
            className="border-slate-200 dark:border-mm-border bg-slate-50/50 dark:bg-slate-800/30"
            contentClassName="py-8 text-center"
          >
            <p className="text-slate-500 dark:text-mm-subtleText">
              {t('messages.noTransactions', 'Bu kategoriye ait işlem bulunamadı.')}
            </p>
          </Card>
        )}
      </div>
    </Modal>
  )
}

export default ViewCategoryModal

