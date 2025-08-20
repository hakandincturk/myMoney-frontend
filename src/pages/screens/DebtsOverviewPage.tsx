import React, { useMemo, useState } from 'react'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCreateTransactionMutation, TransactionType, TransactionStatus } from '@/services/transactionApi'
import { TransactionHelpers } from '../../types'
import { useListMyActiveContactsQuery } from '@/services/contactApi'
import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

// Mock veri - gerçek servisler hazır olana kadar
const MOCK_DEBTS = [
  { id: 1, contact: 'Ahmet Yılmaz', account: 'Nakit', amount: 1200, status: TransactionStatus.PENDING },
  { id: 2, contact: 'Market', account: 'Banka', amount: 4500, status: TransactionStatus.PARTIAL },
]

type Debt = {
  id: number
  contact: string
  account: string
  amount: number
  status: TransactionStatus
}

const columnHelper = createColumnHelper<Debt>()

export const DebtsOverviewPage: React.FC = () => {
  const { t } = useTranslation()
  const { data: contactsData } = useListMyActiveContactsQuery()
  const { data: accountsData } = useListMyActiveAccountsQuery()
  const contacts = useMemo(() => contactsData?.data ?? [], [contactsData])
  const accounts = useMemo(() => accountsData?.data ?? [], [accountsData])
  const [createTransaction, { isLoading }] = useCreateTransactionMutation()
  
  const columns = [
    columnHelper.accessor('contact', {
      header: t('table.columns.contact'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('account', {
      header: t('table.columns.account'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('amount', {
      header: t('table.columns.amount'),
      cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
    }),
    columnHelper.accessor('status', {
      header: t('table.columns.status'),
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
  ]

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    contactId: undefined as number | undefined,
    accountId: undefined as number | undefined,
    type: TransactionType.DEBT as TransactionType,
    totalAmount: '0',
    totalInstallment: 1,
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.accountId || !form.totalAmount) return
    
    // Para formatından sayıya çevir
    const totalAmountNumber = parseFloat(form.totalAmount.replace(/\./g, '').replace(',', '.')) || 0
    
    await createTransaction({
      accountId: form.accountId,
      contactId: form.contactId,
      description: form.description || undefined,
      totalAmount: totalAmountNumber,
      type: form.type,
      totalInstallment: form.totalInstallment || undefined,
    })
    
    setForm({ contactId: undefined, accountId: undefined, type: TransactionType.DEBT, totalAmount: '0', totalInstallment: 1, description: '' })
    setModalOpen(false)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.debts')}</h2>
          <Button 
            onClick={() => setModalOpen(true)} 
            variant="primary"
          >
            {t('buttons.newDebt')}
          </Button>
        </div>

        <Table 
          data={MOCK_DEBTS} 
          columns={columns} 
          title={t('table.titles.debtList')}
          showPagination={MOCK_DEBTS.length > 10}
          pageSize={10}
        />

        {/* Borç Girişi Modal */}
        <Modal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)} 
          title={t('modals.newDebt')}
          footer={(
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setModalOpen(false)} 
                variant="secondary"
              >
                {t('buttons.cancel')}
              </Button>
              <Button 
                onClick={handleSubmit as unknown as () => void} 
                disabled={isLoading}
                variant="primary"
              >
                {isLoading ? t('common.loading') : t('buttons.save')}
              </Button>
            </div>
          )}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <Select 
              id="accountId"
              label="Hesap *"
              value={form.accountId ?? ''}
              onChange={(value) => setForm((p) => ({ ...p, accountId: value as number }))}
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
              placeholder="Hesap seçiniz"
              required
            />
            
            <Select 
              id="contactId"
              label="Kişi"
              value={form.contactId ?? ''}
              onChange={(value) => setForm((p) => ({ ...p, contactId: value as number }))}
              options={contacts.map((c) => ({ value: c.id, label: c.fullName }))}
              placeholder="Kişi seçiniz (opsiyonel)"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                id="totalAmount"
                label="Tutar *"
                value={form.totalAmount}
                onChange={(value) => setForm((p) => ({ ...p, totalAmount: value as string }))}
                placeholder="0,00"
                formatCurrency
                currencySymbol="₺"
                required
              />
              <Input 
                id="totalInstallment"
                label="Taksit Sayısı"
                type="number"
                value={form.totalInstallment}
                onChange={(value) => setForm((p) => ({ ...p, totalInstallment: value as number }))}
                placeholder="1"
                min={1}
                step={1}
              />
            </div>
            
            <Select 
              id="type"
              label="İşlem Türü"
              value={form.type}
              onChange={(value) => setForm((p) => ({ ...p, type: value as TransactionType }))}
              options={TransactionHelpers.getTypeOptions()}
              placeholder="İşlem türü seçiniz"
              required
            />
            
            <Input 
              id="description"
              label="Açıklama"
              value={form.description}
              onChange={(value) => setForm((p) => ({ ...p, description: value as string }))}
              placeholder="Açıklama ekleyiniz (opsiyonel)"
            />
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default DebtsOverviewPage


