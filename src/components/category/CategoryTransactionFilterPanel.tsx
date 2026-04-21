import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { CategoryDTOs } from '@/types/category'

export type CategoryTransactionFilters = {
  transactionName?: string
  accountIds?: number[]
  types?: CategoryDTOs.TransactionFilterType[]
  statuses?: CategoryDTOs.TransactionFilterStatus[]
  minAmount?: number
  maxAmount?: number
  minInstallmentCount?: number
  maxInstallmentCount?: number
}

type Props = {
  isOpen: boolean
  onToggle: () => void
  appliedFilters: CategoryTransactionFilters
  activeCount: number
  onApply: (filters: CategoryTransactionFilters) => void
  onClear: () => void
}

const TYPE_VALUES: CategoryDTOs.TransactionFilterType[] = ['DEBT', 'CREDIT', 'PAYMENT', 'COLLECTION']
const STATUS_VALUES: CategoryDTOs.TransactionFilterStatus[] = ['PENDING', 'PARTIAL', 'PAID']

// Parses a TR-formatted amount string (e.g. "1.234,56" or "1234,5") into a number
const parseAmountText = (raw: string): number | undefined => {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  // Reject anything outside digits, comma, dot
  if (!/^[\d.,]+$/.test(trimmed)) return undefined
  const normalized = trimmed.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  return Number.isNaN(num) || num < 0 ? undefined : num
}

const formatAmountTR = (n: number): string =>
  n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatAmountForInput = (n: number | undefined): string =>
  typeof n === 'number' ? formatAmountTR(n) : ''

const parseIntText = (raw: string): number | undefined => {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  if (!/^\d+$/.test(trimmed)) return undefined
  const num = parseInt(trimmed, 10)
  return Number.isNaN(num) || num < 0 ? undefined : num
}

const formatIntForInput = (n: number | undefined): string =>
  typeof n === 'number' ? String(n) : ''

// Cleans empty strings, undefined, NaN and empty arrays out of the filter payload
const sanitize = (draft: CategoryTransactionFilters): CategoryTransactionFilters => {
  const clean: CategoryTransactionFilters = {}
  if (draft.transactionName && draft.transactionName.trim().length > 0) {
    clean.transactionName = draft.transactionName.trim()
  }
  if (draft.accountIds && draft.accountIds.length > 0) clean.accountIds = draft.accountIds
  if (draft.types && draft.types.length > 0) clean.types = draft.types
  if (draft.statuses && draft.statuses.length > 0) clean.statuses = draft.statuses
  if (typeof draft.minAmount === 'number' && !Number.isNaN(draft.minAmount)) clean.minAmount = draft.minAmount
  if (typeof draft.maxAmount === 'number' && !Number.isNaN(draft.maxAmount)) clean.maxAmount = draft.maxAmount
  if (typeof draft.minInstallmentCount === 'number' && !Number.isNaN(draft.minInstallmentCount)) {
    clean.minInstallmentCount = draft.minInstallmentCount
  }
  if (typeof draft.maxInstallmentCount === 'number' && !Number.isNaN(draft.maxInstallmentCount)) {
    clean.maxInstallmentCount = draft.maxInstallmentCount
  }
  return clean
}

export const CategoryTransactionFilterPanel: React.FC<Props> = ({
  isOpen,
  onToggle,
  appliedFilters,
  activeCount,
  onApply,
  onClear,
}) => {
  const { t } = useTranslation()

  const [draft, setDraft] = useState<CategoryTransactionFilters>(appliedFilters)

  // Text-state for numeric inputs — kept separately so empty state stays empty
  // (Number('') === 0 would otherwise collapse a cleared field to 0)
  const [minAmountText, setMinAmountText] = useState(formatAmountForInput(appliedFilters.minAmount))
  const [maxAmountText, setMaxAmountText] = useState(formatAmountForInput(appliedFilters.maxAmount))
  const [minInstallmentText, setMinInstallmentText] = useState(formatIntForInput(appliedFilters.minInstallmentCount))
  const [maxInstallmentText, setMaxInstallmentText] = useState(formatIntForInput(appliedFilters.maxInstallmentCount))

  // Keep local state in sync when applied filters change externally (e.g. on clear)
  useEffect(() => {
    setDraft(appliedFilters)
    setMinAmountText(formatAmountForInput(appliedFilters.minAmount))
    setMaxAmountText(formatAmountForInput(appliedFilters.maxAmount))
    setMinInstallmentText(formatIntForInput(appliedFilters.minInstallmentCount))
    setMaxInstallmentText(formatIntForInput(appliedFilters.maxInstallmentCount))
  }, [appliedFilters])

  // Load account options only when the panel is open to avoid needless requests
  const { data: accountsData } = useListMyActiveAccountsQuery(
    { pageNumber: 0, pageSize: 100, columnName: 'name', asc: true },
    { skip: !isOpen }
  )

  const accountOptions = useMemo(
    () =>
      (accountsData?.data?.content ?? []).map((account) => ({
        value: account.id,
        label: account.name,
      })),
    [accountsData]
  )

  const typeOptions = useMemo(
    () =>
      TYPE_VALUES.map((value) => ({
        value,
        label: t(`transaction.types.${value.toLowerCase()}`),
      })),
    [t]
  )

  const statusOptions = useMemo(
    () =>
      STATUS_VALUES.map((value) => ({
        value,
        label: t(`status.${value.toLowerCase()}`),
      })),
    [t]
  )

  // Parse numeric text state. Empty text -> undefined (no filter).
  // Non-empty but unparseable -> undefined + parseError flag true.
  const parsedMinAmount = parseAmountText(minAmountText)
  const parsedMaxAmount = parseAmountText(maxAmountText)
  const parsedMinInstallment = parseIntText(minInstallmentText)
  const parsedMaxInstallment = parseIntText(maxInstallmentText)

  const minAmountInvalid = minAmountText.trim() !== '' && parsedMinAmount === undefined
  const maxAmountInvalid = maxAmountText.trim() !== '' && parsedMaxAmount === undefined
  const minInstallmentInvalid = minInstallmentText.trim() !== '' && parsedMinInstallment === undefined
  const maxInstallmentInvalid = maxInstallmentText.trim() !== '' && parsedMaxInstallment === undefined

  const amountRangeInvalid =
    parsedMinAmount !== undefined &&
    parsedMaxAmount !== undefined &&
    parsedMinAmount > parsedMaxAmount

  const installmentRangeInvalid =
    parsedMinInstallment !== undefined &&
    parsedMaxInstallment !== undefined &&
    parsedMinInstallment > parsedMaxInstallment

  const hasValidationError =
    minAmountInvalid ||
    maxAmountInvalid ||
    minInstallmentInvalid ||
    maxInstallmentInvalid ||
    amountRangeInvalid ||
    installmentRangeInvalid

  const handleApply = () => {
    if (hasValidationError) return
    onApply(
      sanitize({
        ...draft,
        minAmount: parsedMinAmount,
        maxAmount: parsedMaxAmount,
        minInstallmentCount: parsedMinInstallment,
        maxInstallmentCount: parsedMaxInstallment,
      })
    )
  }

  const handleClear = () => {
    setDraft({})
    setMinAmountText('')
    setMaxAmountText('')
    setMinInstallmentText('')
    setMaxInstallmentText('')
    onClear()
  }

  // Integer input: strip anything that isn't a digit, keep as plain string
  const handleIntChange = (setter: (v: string) => void) => (raw: string | number) => {
    const s = typeof raw === 'string' ? raw : String(raw)
    setter(s.replace(/\D/g, ''))
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-mm-border bg-white dark:bg-mm-card overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('filters.transactionFilters')}
          </span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {activeCount}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500 dark:text-mm-subtleText">
          {isOpen ? t('filters.hideFilters') : t('filters.showFilters')}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 border-t border-slate-100 dark:border-mm-border">
          {/* Row 1: name + accounts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="filter-transaction-name"
              size="sm"
              label={t('filters.transactionName')}
              value={draft.transactionName ?? ''}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, transactionName: typeof value === 'string' ? value : String(value) }))
              }
              placeholder={t('placeholders.searchByTransactionName')}
            />
            <Select
              id="filter-account-ids"
              label={t('filters.accounts')}
              value={draft.accountIds ?? []}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  accountIds: Array.isArray(value) ? (value as number[]) : [value as number],
                }))
              }
              options={accountOptions}
              isMulti
              closeMenuOnSelect={false}
              placeholder={t('filters.selectAccounts')}
              usePortal
            />
          </div>

          {/* Row 2: types + statuses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              id="filter-types"
              label={t('filters.types')}
              value={draft.types ?? []}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  types: Array.isArray(value)
                    ? (value as CategoryDTOs.TransactionFilterType[])
                    : [value as CategoryDTOs.TransactionFilterType],
                }))
              }
              options={typeOptions}
              isMulti
              closeMenuOnSelect={false}
              placeholder={t('filters.selectTypes')}
              searchable={false}
              usePortal
            />
            <Select
              id="filter-statuses"
              label={t('filters.statuses')}
              value={draft.statuses ?? []}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  statuses: Array.isArray(value)
                    ? (value as CategoryDTOs.TransactionFilterStatus[])
                    : [value as CategoryDTOs.TransactionFilterStatus],
                }))
              }
              options={statusOptions}
              isMulti
              closeMenuOnSelect={false}
              placeholder={t('filters.selectStatuses')}
              searchable={false}
              usePortal
            />
          </div>

          {/* Row 3: amount range — text inputs with TR currency formatting on blur */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
              {t('filters.amountRange')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="filter-min-amount"
                size="sm"
                formatCurrency
                value={minAmountText}
                onChange={(value) => setMinAmountText(typeof value === 'string' ? value : String(value))}
                placeholder={t('filters.minAmount')}
                error={
                  minAmountInvalid
                    ? t('validation.invalidNumber')
                    : amountRangeInvalid
                      ? t('validation.minGreaterThanMax')
                      : undefined
                }
              />
              <Input
                id="filter-max-amount"
                size="sm"
                formatCurrency
                value={maxAmountText}
                onChange={(value) => setMaxAmountText(typeof value === 'string' ? value : String(value))}
                placeholder={t('filters.maxAmount')}
                error={maxAmountInvalid ? t('validation.invalidNumber') : undefined}
              />
            </div>
          </div>

          {/* Row 4: installment range — digit-only text inputs */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
              {t('filters.installmentRange')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="filter-min-installment"
                size="sm"
                value={minInstallmentText}
                onChange={handleIntChange(setMinInstallmentText)}
                placeholder={t('filters.minInstallmentCount')}
                error={
                  minInstallmentInvalid
                    ? t('validation.invalidNumber')
                    : installmentRangeInvalid
                      ? t('validation.minGreaterThanMax')
                      : undefined
                }
              />
              <Input
                id="filter-max-installment"
                size="sm"
                value={maxInstallmentText}
                onChange={handleIntChange(setMaxInstallmentText)}
                placeholder={t('filters.maxInstallmentCount')}
                error={maxInstallmentInvalid ? t('validation.invalidNumber') : undefined}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={handleClear}>
              {t('buttons.clearFilters')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={hasValidationError}
            >
              {t('buttons.applyFilters')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryTransactionFilterPanel
