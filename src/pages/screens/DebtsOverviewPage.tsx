import React, { useMemo, useState, useRef, useEffect } from 'react'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Skeleton, TableSkeleton, FormFieldSkeleton } from '@/components/ui/Skeleton'
import { useCreateTransactionMutation, useListMyTransactionsQuery, useDeleteTransactionMutation, TransactionType, TransactionStatus } from '@/services/transactionApi'
import { TransactionHelpers } from '../../types'

import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { useListMyActiveContactsQuery } from '@/services/contactApi'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../hooks/useToast'

// Dummy veriler kaldırıldı; tablo gerçek API verisine bağlandı

// API'den gelen veri yapısına göre tip tanımı (endpoints.json'dan)
type TransactionListItem = {
  id: number
  contactName: string
  accountName: string
  type: string
  status: string
  totalAmount: number
  paidAmount: number
  totalInstallment: number
}

const columnHelper = createColumnHelper<TransactionListItem>()

export const DebtsOverviewPage: React.FC = () => {
  const { t } = useTranslation()
  const { data: accountsData, isLoading: accountsLoading } = useListMyActiveAccountsQuery(undefined, {
    // Sadece gerekli olduğunda refetch yap
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  const { data: contactsData, isLoading: contactsLoading } = useListMyActiveContactsQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  const { data: transactionsData, isLoading: transactionsLoading } = useListMyTransactionsQuery(undefined, {
    // Sadece gerekli olduğunda refetch yap
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  const accounts = useMemo(() => accountsData?.data ?? [], [accountsData])
  const contacts = useMemo(() => contactsData?.data ?? [], [contactsData])
  const [createTransaction, { isLoading: createLoading }] = useCreateTransactionMutation()
  const [deleteTransaction] = useDeleteTransactionMutation()
  const { showToast } = useToast()
  
  // Genel loading durumu
  const isLoading = accountsLoading || contactsLoading || transactionsLoading

  // Modal açıldığında ilk input'a focus olmak için ref
  const accountSelectRef = useRef<HTMLDivElement>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionListItem | null>(null)
  const [form, setForm] = useState({
    accountId: undefined as number | undefined,
    contactId: undefined as number | undefined,
    type: TransactionType.DEBT as TransactionType,
    totalAmount: '0',
    totalInstallment: 1,
    description: '',
    debtDate: new Date().toISOString().split('T')[0], // Bugünün tarihi
  })

  // Modal açıldığında ilk input'a focus ol
  useEffect(() => {
    if (modalOpen && accountSelectRef.current) {
      setTimeout(() => {
        accountSelectRef.current?.focus()
      }, 100)
    }
  }, [modalOpen])

  // İşlem detayını göster
  const showTransactionDetail = (transaction: TransactionListItem) => {
    setSelectedTransaction(transaction)
    setDetailModalOpen(true)
  }

  // Borç silme modal'ını aç
  const showDeleteModal = (transaction: TransactionListItem) => {
    setSelectedTransaction(transaction)
    setDeleteModalOpen(true)
  }

  // Borç silme işlemi
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction?.id) return

    try {
      await deleteTransaction(selectedTransaction.id).unwrap()
      showToast(t('debt.deleteSuccess'), 'success')
      setDeleteModalOpen(false)
      setSelectedTransaction(null)
    } catch (error) {
      showToast(t('messages.operationFailed'), 'error')
    }
  }

  // İşlem türü metnini al (component içinde tanımlandı)
  const getTransactionTypeText = (type: string): string => {
    return TransactionHelpers.getTypeText(type as TransactionType, t)
  }

  // İşlem durumu metnini al
  const getTransactionStatusText = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return t('status.pending')
      case 'PAID':
        return t('status.paid')
      case 'PARTIAL':
        return t('status.partial')
      case 'ACTIVE':
        return t('status.active')
      case 'INACTIVE':
        return t('status.inactive')
      case 'BLOCKED':
        return t('status.blocked')
      default:
        return status
    }
  }

  // API'den gelen işlemleri sadece borçlar olarak filtrele
  const debts: TransactionListItem[] = useMemo(() => {
    if (!transactionsData?.data) return []
    
    // API'den gelen veriyi doğru şekilde map et
    const txs = transactionsData.data.map((item: any) => ({
      id: item.id,
      contactName: item.contactName || item.contact?.fullName || '-',
      accountName: item.accountName || item.account?.name || 'Bilinmeyen',
      type: item.type,
      status: item.status,
      totalAmount: item.totalAmount || 0,
      paidAmount: item.paidAmount || 0,
      totalInstallment: item.totalInstallment || 1
    }))
    
    return txs
  }, [transactionsData])

  const columns = [
    columnHelper.accessor('contactName', {
      header: t('table.columns.contact'),
      cell: (info) => info.getValue(),
      meta: {
        className: 'min-w-[150px]'
      }
    }),
    columnHelper.accessor('accountName', {
      header: t('table.columns.account'),
      cell: (info) => info.getValue(),
      meta: {
        className: 'min-w-[120px]'
      }
    }),
    columnHelper.accessor('type', {
      header: t('table.columns.type'),
      cell: (info) => getTransactionTypeText(info.getValue()),
      meta: {
        className: 'min-w-[100px]'
      }
    }),
    columnHelper.accessor('totalAmount', {
      header: t('table.columns.totalAmount'),
      cell: (info) => (
        <span className="font-semibold">
          ₺{info.getValue().toLocaleString('tr-TR')}
        </span>
      ),
      meta: {
        className: 'min-w-[120px] text-right'
      }
    }),
    columnHelper.accessor('paidAmount', {
      header: t('table.columns.paidAmount'),
      cell: (info) => {
        const paidAmount = info.getValue() || 0
        const colorClass = paidAmount > 0 ? 'text-green-600 font-semibold' : 'text-gray-600'
        return (
          <span className={colorClass}>
            ₺{paidAmount.toLocaleString('tr-TR')}
          </span>
        )
      },
      meta: {
        className: 'min-w-[120px] text-right'
      }
    }),
    columnHelper.display({
      id: 'remainingAmount',
      header: t('table.columns.remainingAmount'),
      cell: (info) => {
        const totalAmount = info.row.original.totalAmount || 0
        const paidAmount = info.row.original.paidAmount || 0
        const remaining = totalAmount - paidAmount
        const colorClass = remaining > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'
        return (
          <span className={colorClass}>
            ₺{remaining.toLocaleString('tr-TR')}
          </span>
        )
      },
      meta: {
        className: 'min-w-[120px] text-right'
      }
    }),
    columnHelper.accessor('status', {
      header: t('table.columns.status'),
      cell: (info) => <StatusBadge status={info.getValue() as TransactionStatus} />,
      meta: {
        className: 'min-w-[100px]'
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.columns.actions'),
      cell: (info) => (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={() => showTransactionDetail(info.row.original)}
            variant="secondary"
            className="px-3 py-1 text-xs"
          >
            {t('buttons.viewDetails')}
          </Button>
          <Button
            onClick={() => showDeleteModal(info.row.original)}
            variant="secondary"
            className="px-3 py-1 text-xs bg-red-50 hover:!bg-red-100 text-red-600 border-red-200 hover:!border-red-300 dark:bg-red-500 dark:hover:!bg-red-600 dark:text-white dark:border-red-500 dark:hover:!border-red-600"
          >
            {t('buttons.deleteDebt')}
          </Button>
        </div>
      ),
      meta: {
        className: 'min-w-[200px]'
      }
    }),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.accountId || !form.totalAmount) return
    
    // Para formatından sayıya çevir
    const totalAmountNumber = parseFloat(form.totalAmount.replace(/\./g, '').replace(',', '.')) || 0
    
    try {
      const result = await createTransaction({
        accountId: form.accountId,
        contactId: form.contactId || undefined,
        description: form.description || undefined,
        totalAmount: totalAmountNumber,
        type: form.type,
        totalInstallment: form.totalInstallment || undefined,
        debtDate: form.debtDate,
      }).unwrap()
      
      // Sadece başarılı sonuçta modal'ı kapat
      if (result && result.type === true) {
        setForm({ accountId: undefined, contactId: undefined, type: TransactionType.DEBT, totalAmount: '0', totalInstallment: 1, description: '', debtDate: new Date().toISOString().split('T')[0] })
        setModalOpen(false)
        showToast(t('messages.transactionCreated'), 'success')
      }
    } catch (error) {
      // Hata durumunda modal açık kalır, kullanıcı düzeltebilir
      console.error('Transaction creation failed:', error)
      const errorMessage = (error as any)?.data?.message || t('messages.operationFailed')
      showToast(errorMessage, 'error')
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.debts')}</h2>
          <Button 
            onClick={() => { 
              setForm({ accountId: undefined, contactId: undefined, type: TransactionType.DEBT, totalAmount: '0', totalInstallment: 1, description: '', debtDate: new Date().toISOString().split('T')[0] })
              setModalOpen(true) 
            }} 
            variant="primary"
          >
            {t('buttons.newDebt')}
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={8} rows={5} />
        ) : (
          <Table 
            data={debts} 
            columns={columns} 
            title={t('table.titles.debtList')}
            showPagination={true}
            pageSize={10}
          />
        )}

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
                disabled={createLoading}
                variant="primary"
              >
                {createLoading ? t('common.loading') : t('buttons.save')}
              </Button>
            </div>
          )}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            {accountsLoading || contactsLoading ? (
              <>
                <FormFieldSkeleton />
                <div className="grid grid-cols-2 gap-4">
                  <FormFieldSkeleton />
                  <FormFieldSkeleton />
                </div>
                <FormFieldSkeleton />
                <FormFieldSkeleton />
                <FormFieldSkeleton />
              </>
            ) : (
              <>
                <Select 
                  id="contactId"
                  label={t('table.columns.contact')}
                  value={form.contactId ?? ''}
                  onChange={(value) => setForm((p) => ({ ...p, contactId: value as number }))}
                  options={contacts.map((c) => ({ value: c.id, label: c.fullName }))}
                  placeholder="Kişi seçiniz (opsiyonel)"
                />
                <Select 
                  id="accountId"
                  label="Hesap *"
                  value={form.accountId ?? ''}
                  onChange={(value) => setForm((p) => ({ ...p, accountId: value as number }))}
                  options={accounts.map((a) => ({ value: a.id, label: a.name }))}
                  placeholder="Hesap seçiniz"
                  required
                  ref={accountSelectRef}
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
                  options={TransactionHelpers.getTypeOptions(t)}
                  placeholder="İşlem türü seçiniz"
                  required
                />
                
                <DatePicker
                  id="debtDate"
                  label={t('transaction.debtDate')}
                  value={form.debtDate}
                  onChange={(value) => setForm((p) => ({ ...p, debtDate: value as string }))}
                  required
                />
                
                <Input 
                  id="description"
                  label="Açıklama"
                  value={form.description}
                  onChange={(value) => setForm((p) => ({ ...p, description: value as string }))}
                  placeholder="Açıklama ekleyiniz (opsiyonel)"
                />
              </>
            )}
          </form>
        </Modal>
        
        {/* İşlem Detay Modal */}
        <Modal 
          open={detailModalOpen} 
          onClose={() => setDetailModalOpen(false)} 
          title={t('modals.transactionDetail')}
          footer={(
            <div className="flex justify-end">
              <Button 
                onClick={() => setDetailModalOpen(false)} 
                variant="secondary"
              >
                {t('buttons.close')}
              </Button>
            </div>
          )}
        >
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.contact')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text">{selectedTransaction.contactName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.account')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text">{selectedTransaction.accountName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.type')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text">{getTransactionTypeText(selectedTransaction.type as string)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.status')}
                  </label>
                  <StatusBadge status={selectedTransaction.status as TransactionStatus} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.amount')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text font-semibold">
                    ₺{selectedTransaction.totalAmount.toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.paidAmount')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text">
                    ₺{selectedTransaction.paidAmount.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
              
              {selectedTransaction.totalInstallment > 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-1">
                    {t('table.columns.totalInstallment')}
                  </label>
                  <p className="text-slate-900 dark:text-mm-text">{selectedTransaction.totalInstallment} taksit</p>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Borç Silme Modal */}
        <Modal 
          open={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)} 
          title={t('modals.deleteDebt')}
          footer={(
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setDeleteModalOpen(false)} 
                variant="secondary"
              >
                {t('buttons.cancel')}
              </Button>
              <Button 
                onClick={handleDeleteTransaction}
                variant="secondary"
                className="bg-red-50 hover:!bg-red-100 text-red-600 border-red-200 hover:!border-red-300 dark:bg-red-500 dark:hover:!bg-red-600 dark:text-white dark:border-red-500 dark:hover:!border-red-600"
              >
                {t('buttons.delete')}
              </Button>
            </div>
          )}
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400 text-lg">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {t('debt.deleteConfirmation')}
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{t('debt.deleteWarning')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedTransaction && (
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-mm-text mb-2">
                  Borç Detayları:
                </h4>
                <div className="space-y-1 text-sm text-slate-600 dark:text-mm-subtleText">
                  <p><strong>Kişi:</strong> {selectedTransaction.contactName}</p>
                  <p><strong>Hesap:</strong> {selectedTransaction.accountName}</p>
                  <p><strong>Tutar:</strong> ₺{selectedTransaction.totalAmount.toLocaleString('tr-TR')}</p>
                  <p><strong>Durum:</strong> {getTransactionStatusText(selectedTransaction.status)}</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default DebtsOverviewPage


