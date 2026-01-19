import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { DatePicker } from '@/components/ui/DatePicker'
import TransactionFormModal, { TransactionFormValues } from '@/components/transaction/TransactionFormModal'
import { useCreateTransactionMutation } from '@/services/transactionApi'
import { useCreateContactMutation } from '@/services/contactApi'
import { useCreateAccountMutation } from '@/services/accountApi'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { useListMyActiveContactsQuery } from '@/services/contactApi'
import { TransactionType } from '@/services/transactionApi'
import { AccountType, CurrencyType } from '@/services/accountApi'
import { useListMyActiveCategoriesQuery } from '@/services/categoryApi'
import { TransactionHelpers } from '../../types'

interface QuickAction {
  title: string
  description: string
  icon: string | React.ReactNode
  color: 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'indigo'
  actionType: 'income' | 'expense' | 'installment' | 'budget' | 'account' | 'contact' | 'reports'
}

interface QuickActionsProps {
  className?: string
}

export const QuickActions: React.FC<QuickActionsProps> = ({ className = '' }) => {
  const { t } = useTranslation()
  
  // Modal state'leri
  const [activeModal, setActiveModal] = useState<string | null>(null)
  
  // API hooks
  const [createTransaction, { isLoading: createLoading }] = useCreateTransactionMutation()
  const [createContact] = useCreateContactMutation()
  const [createAccount] = useCreateAccountMutation()
  
  // Data hooks
  const { data: accountsData, isLoading: accountsLoading } = useListMyActiveAccountsQuery({
    pageNumber: 0,
    pageSize: 50,
    columnName: 'id',
    asc: false
  })
  
  const { data: contactsData, isLoading: contactsLoading } = useListMyActiveContactsQuery({
    pageNumber: 0,
    pageSize: 50,
    columnName: 'id',
    asc: false
  })

  const { data: categoriesData } = useListMyActiveCategoriesQuery({ pageNumber: 0, pageSize: 50 })
  
  // Form state'leri
  const [transactionForm, setTransactionForm] = useState<TransactionFormValues>({
    accountId: undefined,
    contactId: undefined,
    type: TransactionType.DEBT,
    totalAmount: '0',
    totalInstallment: 1,
    name: '',
    description: '',
    debtDate: new Date().toISOString().split('T')[0],
    equalSharingBetweenInstallments: true,
    categoryIds: [],
    newCategories: [],
  })
  const [transactionErrors, setTransactionErrors] = useState<Record<string, string | undefined>>({})
  
  const [contactForm, setContactForm] = useState({
    fullName: '',
    note: ''
  })
  
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: AccountType.CASH as AccountType,
    currency: CurrencyType.TL as CurrencyType,
    balance: '0',
  })

  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: number | string; label: string }>>([])
  
  // Helper functions
  const accounts = accountsData?.data?.content || []
  const contacts = contactsData?.data?.content || []

  useEffect(() => {
    if (categoriesData?.data?.content) {
      setCategoryOptions(categoriesData.data.content.map((c) => ({ value: c.id, label: c.name })))
    }
  }, [categoriesData])

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: {
        bg: 'bg-emerald-500 hover:bg-emerald-600',
        text: 'text-white',
        icon: 'bg-emerald-400',
      },
      red: {
        bg: 'bg-rose-500 hover:bg-rose-600',
        text: 'text-white',
        icon: 'bg-rose-400',
      },
      blue: {
        bg: 'bg-blue-500 hover:bg-blue-600',
        text: 'text-white',
        icon: 'bg-blue-400',
      },
      purple: {
        bg: 'bg-purple-500 hover:bg-purple-600',
        text: 'text-white',
        icon: 'bg-purple-400',
      },
      amber: {
        bg: 'bg-amber-500 hover:bg-amber-600',
        text: 'text-white',
        icon: 'bg-amber-400',
      },
      indigo: {
        bg: 'bg-indigo-500 hover:bg-indigo-600',
        text: 'text-white',
        icon: 'bg-indigo-400',
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

    const parseCurrencyToNumber = (input: any): number | undefined => {
      if (input === undefined || input === null) return undefined
      if (typeof input === 'number') return input
      if (typeof input === 'string') {
        const normalized = input.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.\-]/g, '')
        const num = Number(normalized)
        return isNaN(num) ? undefined : num
      }
      return undefined
    }

    const selectedAccount = useMemo(() => accounts.find((a) => a.id === transactionForm.accountId), [accounts, transactionForm.accountId])
    const isCreditCardAccount = selectedAccount?.type === AccountType.CREDIT_CARD

    const baseTypeOptions = useMemo(() => TransactionHelpers.getTypeOptions(t), [t])
    const variantTypeOptions = useMemo(() => {
      let opts = baseTypeOptions
      if (activeModal === 'income') {
        opts = opts.filter((opt) => opt.value === TransactionType.CREDIT || opt.value === TransactionType.COLLECTION)
      } else if (activeModal === 'expense') {
        opts = opts.filter((opt) => opt.value === TransactionType.DEBT || opt.value === TransactionType.PAYMENT)
      } else if (activeModal === 'installment') {
        opts = opts.filter((opt) => opt.value === TransactionType.DEBT)
      }
      if (isCreditCardAccount) {
        opts = opts.filter((opt) => opt.value === TransactionType.DEBT || opt.value === TransactionType.PAYMENT || opt.value === TransactionType.CREDIT)
      }
      return opts
    }, [activeModal, baseTypeOptions, isCreditCardAccount])

    const handleAccountChange = (value: unknown) => {
      const newAccountId = value as number
      const acc = accounts.find((a) => a.id === newAccountId)
      setTransactionForm((prev) => {
        let nextType = prev.type
        if (acc?.type === AccountType.CREDIT_CARD && nextType !== TransactionType.DEBT && nextType !== TransactionType.PAYMENT && nextType !== TransactionType.CREDIT) {
          nextType = TransactionType.DEBT
        }
        return { ...prev, accountId: newAccountId, type: nextType }
      })
    }

  const quickActions: QuickAction[] = [
    {
      title: 'Gelir Ekle',
      description: 'Yeni gelir kaydı oluştur',
      icon: '💰',
      color: 'green',
      actionType: 'income'
    },
    {
      title: 'Gider Ekle',
      description: 'Yeni gider kaydı oluştur',
      icon: '💸',
      color: 'red',
      actionType: 'expense'
    },
    {
      title: 'Taksit Ekle',
      description: 'Taksitli ödeme planı oluştur',
      icon: <FontAwesomeIcon icon={faCalendarDays} />,
      color: 'blue',
      actionType: 'installment'
    },
    {
      title: 'Raporlar',
      description: 'Detaylı mali raporları görüntüle',
      icon: '📊',
      color: 'purple',
      actionType: 'reports'
    },
    {
      title: 'Hesap Ekle',
      description: 'Yeni banka/nakit hesabı ekle',
      icon: '🏦',
      color: 'indigo',
      actionType: 'account'
    },
    {
      title: 'Kişi Ekle',
      description: 'Yeni kişi/müşteri ekle',
      icon: '👤',
      color: 'amber',
      actionType: 'contact'
    }
  ]

  // Modal açma fonksiyonları
  const openModal = (actionType: string) => {
    setActiveModal(actionType)
    setTransactionErrors({})
    
    // Form'ları temizle ve varsayılan değerleri ayarla
    if (actionType === 'income' || actionType === 'expense' || actionType === 'installment') {
      const baseType = actionType === 'income' ? TransactionType.CREDIT : TransactionType.DEBT
      setTransactionForm({
        accountId: undefined,
        contactId: undefined,
        type: baseType,
        totalAmount: '0',
        totalInstallment: actionType === 'installment' ? 3 : 1,
        name: '',
        description: '',
        debtDate: new Date().toISOString().split('T')[0],
        equalSharingBetweenInstallments: true,
        categoryIds: [],
        newCategories: [],
      })
    } else if (actionType === 'contact') {
      setContactForm({ fullName: '', note: '' })
    } else if (actionType === 'account') {
      setAccountForm({
        name: '',
        type: AccountType.CASH,
        currency: CurrencyType.TL,
        balance: '0',
      })
    }
  }

  // Form submit fonksiyonları
  const handleTransactionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const newErrors: Record<string, string | undefined> = {}
    if (!transactionForm.accountId) newErrors.accountId = t('validation.required')
    if (!transactionForm.name || !transactionForm.name.trim()) newErrors.name = t('validation.required')
    if (!transactionForm.totalAmount || transactionForm.totalAmount === '0') newErrors.totalAmount = t('validation.required')
    if (!transactionForm.debtDate) newErrors.debtDate = t('validation.required')
    if (transactionForm.totalInstallment !== undefined && Number(transactionForm.totalInstallment) < 1) newErrors.totalInstallment = t('validation.required')
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
      setTransactionForm({
        accountId: undefined,
        contactId: undefined,
        type: TransactionType.DEBT,
        totalAmount: '0',
        totalInstallment: 1,
        name: '',
        description: '',
        debtDate: new Date().toISOString().split('T')[0],
        equalSharingBetweenInstallments: true,
        categoryIds: [],
        newCategories: [],
      })
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('messages.transactionCreated') || 'İşlem başarıyla oluşturuldu', type: 'success' } })) } catch(_) {}
    } catch (error) {
      console.error('Transaction creation failed:', error)
      const errData = (error as any)?.data
      const fieldErrors = errData?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        const mapped: Record<string, string> = {}
        Object.entries(fieldErrors).forEach(([key, messages]) => {
          const firstMessage = Array.isArray(messages) ? String(messages[0]) : String(messages)
          let formKey = key
          if (key === 'totalInstallment') formKey = 'totalInstallment'
          if (key === 'debtDate') formKey = 'debtDate'
          if (key === 'accountId') formKey = 'accountId'
          if (key === 'name') formKey = 'name'
          if (key === 'totalAmount') formKey = 'totalAmount'
          if (key === 'type') formKey = 'type'
          mapped[formKey] = firstMessage
        })
        setTransactionErrors(mapped)
      }
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('messages.operationFailed'), type: 'error' } })) } catch(_) {}
    }
  }

  const handleContactSubmit = async () => {
    if (!contactForm.fullName.trim()) return

    try {
      await createContact({
        fullName: contactForm.fullName,
        note: contactForm.note
      }).unwrap()
      
      setActiveModal(null)
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Kişi başarıyla oluşturuldu', type: 'success' } })) } catch(_) {}
    } catch (error) {
      console.error('Contact creation failed:', error)
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Kişi oluşturulamadı', type: 'error' } })) } catch(_) {}
    }
  }

  const handleAccountSubmit = async () => {
    if (!accountForm.name.trim()) return

    try {
      const balanceNumber = parseFloat(accountForm.balance.replace(/\./g, '').replace(',', '.')) || 0
      
      await createAccount({
        ...accountForm,
        balance: balanceNumber
      }).unwrap()
      
      setActiveModal(null)
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Hesap başarıyla oluşturuldu', type: 'success' } })) } catch(_) {}
    } catch (error) {
      console.error('Account creation failed:', error)
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Hesap oluşturulamadı', type: 'error' } })) } catch(_) {}
    }
  }

  const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => {
    const colors = getColorClasses(action.color)
    
    const buttonContent = (
      <div 
        className={`
          relative overflow-hidden rounded-xl p-4 transition-all duration-200 
          transform hover:scale-105 hover:shadow-lg cursor-pointer
          ${colors.bg} ${colors.text}
        `}
        onClick={() => {
          if (action.actionType === 'reports') {
            // Raporlar için sayfaya yönlendir
            window.location.href = '/reports'
          } else {
            openModal(action.actionType)
          }
        }}
      >
        <div className="flex items-start gap-3">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center
            ${colors.icon}
          `}>
            {typeof action.icon === 'string' ? (
              <span className="text-xl">{action.icon}</span>
            ) : (
              <span className="text-xl">{action.icon}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">
              {action.title}
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              {action.description}
            </p>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10"></div>
        <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white/5"></div>
      </div>
    )

    return buttonContent
  }

  return (
    <Card 
      title="Hızlı İşlemler" 
      subtitle="Sık kullanılan kayıt işlemlerine tek tıkla erişin."
      subtitleHelp="Gelir/Gider ekleme ve raporlar gibi en sık yapılan aksiyonlar burada yer alır."
      className={`hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <ActionButton key={index} action={action} />
        ))}
      </div>
      
      {/* Alt bilgi */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Sık kullanılan işlemler</span>
          <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium cursor-pointer">
            Özelleştir
          </span>
        </div>
      </div>

      {/* İşlem Modal'ları */}
      <TransactionFormModal
        open={activeModal === 'income' || activeModal === 'expense' || activeModal === 'installment'}
        onClose={() => setActiveModal(null)}
        title={activeModal === 'income' ? t('dashboard.quickActions.income') || 'Gelir Ekle' : activeModal === 'expense' ? t('dashboard.quickActions.expense') || 'Gider Ekle' : t('dashboard.quickActions.installment') || 'Taksit Ekle'}
        size="lg"
        form={transactionForm}
        errors={transactionErrors}
        accounts={accounts.map((a) => ({ value: a.id, label: a.name }))}
        contacts={contacts.map((c) => ({ value: c.id, label: c.fullName }))}
        categoryOptions={categoryOptions}
        typeOptions={variantTypeOptions}
        accountsLoading={accountsLoading}
        contactsLoading={contactsLoading}
        createLoading={createLoading}
        onSubmit={handleTransactionSubmit}
        onChange={(updater) => setTransactionForm((prev) => updater(prev))}
        onAccountChange={handleAccountChange}
        onCreateCategory={(label) => {
          setTransactionForm((p) => ({ ...p, newCategories: Array.from(new Set([...(p.newCategories || []), label])) }))
          setCategoryOptions((opts) => {
            if (opts.some((o) => o.label.toLowerCase() === label.toLowerCase())) return opts
            return [...opts, { value: label, label }]
          })
        }}
      />

      {/* Kişi Ekleme Modal */}
      <Modal
        open={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title="Kişi Ekle"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setActiveModal(null)} variant="secondary">
              İptal
            </Button>
            <Button onClick={handleContactSubmit} variant="primary">
              Kaydet
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            id="fullName"
            label="Ad Soyad *"
            value={contactForm.fullName}
            onChange={(value) => setContactForm((p) => ({ ...p, fullName: value as string }))}
            placeholder="Ad soyad giriniz"
            required
          />
          <Input
            id="note"
            label="Not"
            value={contactForm.note}
            onChange={(value) => setContactForm((p) => ({ ...p, note: value as string }))}
            placeholder="Not ekleyiniz (opsiyonel)"
          />
        </div>
      </Modal>

      {/* Hesap Ekleme Modal */}
      <Modal
        open={activeModal === 'account'}
        onClose={() => setActiveModal(null)}
        title="Hesap Ekle"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setActiveModal(null)} variant="secondary">
              İptal
            </Button>
            <Button onClick={handleAccountSubmit} variant="primary">
              Kaydet
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            id="name"
            label="Hesap Adı *"
            value={accountForm.name}
            onChange={(value) => setAccountForm((p) => ({ ...p, name: value as string }))}
            placeholder="Hesap adını giriniz"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="type"
              label="Hesap Türü"
              value={accountForm.type}
              onChange={(value) => setAccountForm((p) => ({ ...p, type: value as AccountType }))}
              options={[
                { value: AccountType.CASH, label: 'Nakit' },
                { value: AccountType.BANK, label: 'Banka' },
                { value: AccountType.CREDIT_CARD, label: 'Kredi Kartı' }
              ]}
              placeholder="Tür seçiniz"
              required
            />
            <Select
              id="currency"
              label="Para Birimi"
              value={accountForm.currency}
              onChange={(value) => setAccountForm((p) => ({ ...p, currency: value as CurrencyType }))}
              options={[
                { value: CurrencyType.TL, label: 'TL' },
                { value: CurrencyType.USD, label: 'USD' },
                { value: CurrencyType.EUR, label: 'EUR' }
              ]}
              placeholder="Para birimi seçiniz"
              required
            />
          </div>
          <Input
            id="balance"
            label="Başlangıç Bakiyesi"
            value={accountForm.balance}
            onChange={(value) => setAccountForm((p) => ({ ...p, balance: value as string }))}
            placeholder="0,00"
            formatCurrency
            currencySymbol="₺"
          />
        </div>
      </Modal>
    </Card>
  )
}

export default QuickActions
