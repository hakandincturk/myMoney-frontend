import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateTransactionMutation } from '@/services/transactionApi'
import { useCreateContactMutation } from '@/services/contactApi'
import { useCreateAccountMutation } from '@/services/accountApi'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { useListMyActiveContactsQuery } from '@/services/contactApi'
import { useListMyActiveCategoriesQuery } from '@/services/categoryApi'
import { TransactionType } from '@/services/transactionApi'
import { AccountType, CurrencyType } from '@/services/accountApi'
import type { TransactionFormValues } from '@/components/transaction/TransactionFormModal'
import { TransactionHelpers } from '@/types/index'

// Quick action identifiers used by both the legacy QuickActions card and the v2 CommandBar.
export type QuickActionKind =
  | 'income'
  | 'expense'
  | 'installment'
  | 'account'
  | 'contact'
  | 'reports'

export type ActiveModal = QuickActionKind | null

type CategoryOption = { value: number | string; label: string }

const makeInitialTransactionForm = (kind: QuickActionKind | null): TransactionFormValues => {
  const baseType = kind === 'income' ? TransactionType.CREDIT : TransactionType.DEBT
  return {
    accountId: undefined,
    contactId: undefined,
    type: baseType,
    totalAmount: '0',
    totalInstallment: kind === 'installment' ? 3 : 1,
    name: '',
    description: '',
    debtDate: new Date().toISOString().split('T')[0],
    equalSharingBetweenInstallments: true,
    categoryIds: [],
    newCategories: [],
  }
}

const parseCurrencyToNumber = (input: unknown): number | undefined => {
  if (input === undefined || input === null) return undefined
  if (typeof input === 'number') return input
  if (typeof input === 'string') {
    const normalized = input.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '')
    const num = Number(normalized)
    return isNaN(num) ? undefined : num
  }
  return undefined
}

// Centralises the state and submit handlers for quick-action modals so they can be
// mounted from multiple entry points without duplicating logic.
export const useQuickTransactionActions = () => {
  const { t } = useTranslation()

  const [activeModal, setActiveModal] = useState<ActiveModal>(null)

  const [createTransaction, { isLoading: createLoading }] = useCreateTransactionMutation()
  const [createContact] = useCreateContactMutation()
  const [createAccount] = useCreateAccountMutation()

  const { data: accountsData, isLoading: accountsLoading } = useListMyActiveAccountsQuery({
    pageNumber: 0,
    pageSize: 50,
    columnName: 'id',
    asc: false,
  })

  const { data: contactsData, isLoading: contactsLoading } = useListMyActiveContactsQuery({
    pageNumber: 0,
    pageSize: 50,
    columnName: 'id',
    asc: false,
  })

  const { data: categoriesData } = useListMyActiveCategoriesQuery({ pageNumber: 0, pageSize: 50 })

  const [transactionForm, setTransactionForm] = useState<TransactionFormValues>(
    makeInitialTransactionForm(null),
  )
  const [transactionErrors, setTransactionErrors] = useState<Record<string, string | undefined>>({})

  const [contactForm, setContactForm] = useState({ fullName: '', note: '' })
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: AccountType.CASH as AccountType,
    currency: CurrencyType.TL as CurrencyType,
    balance: '0',
  })

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])

  const accounts = accountsData?.data?.content || []
  const contacts = contactsData?.data?.content || []

  useEffect(() => {
    if (categoriesData?.data?.content) {
      setCategoryOptions(categoriesData.data.content.map((c) => ({ value: c.id, label: c.name })))
    }
  }, [categoriesData])

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === transactionForm.accountId),
    [accounts, transactionForm.accountId],
  )
  const isCreditCardAccount = selectedAccount?.type === AccountType.CREDIT_CARD

  const baseTypeOptions = useMemo(() => TransactionHelpers.getTypeOptions(t), [t])
  const variantTypeOptions = useMemo(() => {
    let opts = baseTypeOptions
    if (activeModal === 'income') {
      opts = opts.filter(
        (opt) => opt.value === TransactionType.CREDIT || opt.value === TransactionType.COLLECTION,
      )
    } else if (activeModal === 'expense') {
      opts = opts.filter(
        (opt) => opt.value === TransactionType.DEBT || opt.value === TransactionType.PAYMENT,
      )
    } else if (activeModal === 'installment') {
      opts = opts.filter((opt) => opt.value === TransactionType.DEBT)
    }
    if (isCreditCardAccount) {
      opts = opts.filter(
        (opt) =>
          opt.value === TransactionType.DEBT ||
          opt.value === TransactionType.PAYMENT ||
          opt.value === TransactionType.CREDIT,
      )
    }
    return opts
  }, [activeModal, baseTypeOptions, isCreditCardAccount])

  const openModal = (kind: QuickActionKind) => {
    if (kind === 'reports') {
      window.location.href = '/reports'
      return
    }
    setActiveModal(kind)
    setTransactionErrors({})
    if (kind === 'income' || kind === 'expense' || kind === 'installment') {
      setTransactionForm(makeInitialTransactionForm(kind))
    } else if (kind === 'contact') {
      setContactForm({ fullName: '', note: '' })
    } else if (kind === 'account') {
      setAccountForm({
        name: '',
        type: AccountType.CASH,
        currency: CurrencyType.TL,
        balance: '0',
      })
    }
  }

  const closeModal = () => setActiveModal(null)

  const handleAccountChange = (value: unknown) => {
    const newAccountId = value as number
    const acc = accounts.find((a) => a.id === newAccountId)
    setTransactionForm((prev) => {
      let nextType = prev.type
      if (
        acc?.type === AccountType.CREDIT_CARD &&
        nextType !== TransactionType.DEBT &&
        nextType !== TransactionType.PAYMENT &&
        nextType !== TransactionType.CREDIT
      ) {
        nextType = TransactionType.DEBT
      }
      return { ...prev, accountId: newAccountId, type: nextType }
    })
  }

  const emitToast = (message: string, type: 'success' | 'error') => {
    try {
      window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type } }))
    } catch (_) {
      // noop
    }
  }

  const handleTransactionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const newErrors: Record<string, string | undefined> = {}
    if (!transactionForm.accountId) newErrors.accountId = t('validation.required')
    if (!transactionForm.name || !transactionForm.name.trim()) newErrors.name = t('validation.required')
    if (!transactionForm.totalAmount || transactionForm.totalAmount === '0')
      newErrors.totalAmount = t('validation.required')
    if (!transactionForm.debtDate) newErrors.debtDate = t('validation.required')
    if (transactionForm.totalInstallment !== undefined && Number(transactionForm.totalInstallment) < 1)
      newErrors.totalInstallment = t('validation.required')
    setTransactionErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const totalAmountNumber = parseCurrencyToNumber(transactionForm.totalAmount) || 0

    try {
      await createTransaction({
        accountId: transactionForm.accountId as number,
        contactId: transactionForm.contactId || undefined,
        name: transactionForm.name || undefined,
        description: transactionForm.description || undefined,
        totalAmount: totalAmountNumber,
        type: transactionForm.type,
        totalInstallment: transactionForm.totalInstallment || undefined,
        debtDate: transactionForm.debtDate,
        equalSharingBetweenInstallments: transactionForm.equalSharingBetweenInstallments,
        category: {
          categoryIds: transactionForm.categoryIds,
          newCategories: transactionForm.newCategories,
        },
      }).unwrap()

      setTransactionErrors({})
      setActiveModal(null)
      setTransactionForm(makeInitialTransactionForm(null))
      emitToast(t('messages.transactionCreated') || 'İşlem başarıyla oluşturuldu', 'success')
    } catch (error) {
      const errData = (error as { data?: { data?: Record<string, unknown> } })?.data
      const fieldErrors = errData?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        const mapped: Record<string, string> = {}
        Object.entries(fieldErrors).forEach(([key, messages]) => {
          const firstMessage = Array.isArray(messages) ? String(messages[0]) : String(messages)
          mapped[key] = firstMessage
        })
        setTransactionErrors(mapped)
      }
      emitToast(t('messages.operationFailed'), 'error')
    }
  }

  const handleContactSubmit = async () => {
    if (!contactForm.fullName.trim()) return
    try {
      await createContact({
        fullName: contactForm.fullName,
        note: contactForm.note,
      }).unwrap()
      setActiveModal(null)
      emitToast(t('dashboard.v2.modals.messages.contactCreated'), 'success')
    } catch (error) {
      emitToast(t('dashboard.v2.modals.messages.contactFailed'), 'error')
    }
  }

  const handleAccountSubmit = async () => {
    if (!accountForm.name.trim()) return
    try {
      const balanceNumber = parseFloat(accountForm.balance.replace(/\./g, '').replace(',', '.')) || 0
      await createAccount({
        ...accountForm,
        balance: balanceNumber,
      }).unwrap()
      setActiveModal(null)
      emitToast(t('dashboard.v2.modals.messages.accountCreated'), 'success')
    } catch (error) {
      emitToast(t('dashboard.v2.modals.messages.accountFailed'), 'error')
    }
  }

  const handleCreateCategory = (label: string) => {
    setTransactionForm((p) => ({
      ...p,
      newCategories: Array.from(new Set([...(p.newCategories || []), label])),
    }))
    setCategoryOptions((opts) => {
      if (opts.some((o) => o.label.toLowerCase() === label.toLowerCase())) return opts
      return [...opts, { value: label, label }]
    })
  }

  return {
    activeModal,
    openModal,
    closeModal,
    // Transaction modal wiring
    transactionForm,
    setTransactionForm,
    transactionErrors,
    variantTypeOptions,
    accounts,
    contacts,
    categoryOptions,
    accountsLoading,
    contactsLoading,
    createLoading,
    handleAccountChange,
    handleTransactionSubmit,
    handleCreateCategory,
    // Contact modal wiring
    contactForm,
    setContactForm,
    handleContactSubmit,
    // Account modal wiring
    accountForm,
    setAccountForm,
    handleAccountSubmit,
  }
}

export type UseQuickTransactionActions = ReturnType<typeof useQuickTransactionActions>
