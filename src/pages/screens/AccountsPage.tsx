import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Skeleton, TableSkeleton, FormFieldSkeleton } from '@/components/ui/Skeleton'
import { AccountType, CurrencyType, useCreateAccountMutation, useListMyActiveAccountsQuery, useUpdateMyAccountMutation } from '@/services/accountApi'
import { AccountHelpers } from '../../types'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../hooks/useToast'

type Account = {
  id: number
  name: string
  type: AccountType
  currency: CurrencyType
  balance: number
  totalBalance: number
  onEdit?: (id: number) => void
}

const columnHelper = createColumnHelper<Account>()

export const AccountsPage: React.FC = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useListMyActiveAccountsQuery(undefined, {
    // Sadece gerekli olduğunda refetch yap
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  })
  const [createAccount] = useCreateAccountMutation()
  const [updateMyAccount] = useUpdateMyAccountMutation()
  const { showToast } = useToast()
  
  // Modal açıldığında ilk input'a focus olmak için ref'ler
  const createNameInputRef = useRef<HTMLInputElement>(null)
  const editNameInputRef = useRef<HTMLInputElement>(null)

  const columns = [
    columnHelper.accessor('name', {
      header: t('table.columns.name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('type', {
      header: t('table.columns.type'),
      cell: (info) => AccountHelpers.getTypeText(info.getValue()),
    }),
    columnHelper.accessor('currency', {
      header: t('table.columns.currency'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('balance', {
      header: t('table.columns.balance'),
      cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
    }),
    columnHelper.accessor('totalBalance', {
      header: t('table.columns.totalBalance'),
      cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.columns.edit'),
      cell: (info) => (
        <div className="flex items-center justify-end">
          <Button 
            onClick={() => info.row.original.onEdit?.(info.row.original.id)} 
            variant="primary"
            className="px-3 py-1.5 text-sm"
          >
            {t('table.columns.edit')}
          </Button>
        </div>
      ),
    }),
  ]

  const [createForm, setCreateForm] = useState({
    name: '',
    type: AccountType.CASH as AccountType,
    currency: CurrencyType.TL as CurrencyType,
    balance: '0',
  })
  const [updateForm, setUpdateForm] = useState<{ id?: number; name: string; totalBalance: string }>({ name: '', totalBalance: '0' })
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

  // Modal açıldığında ilk input'a focus ol
  useEffect(() => {
    if (openCreate && createNameInputRef.current) {
      setTimeout(() => {
        createNameInputRef.current?.focus()
      }, 100)
    }
  }, [openCreate])

  useEffect(() => {
    if (openEdit && editNameInputRef.current) {
      setTimeout(() => {
        editNameInputRef.current?.focus()
      }, 100)
    }
  }, [openEdit])

  const handleEdit = (id: number) => {
    const account = accounts.find((a) => a.id === id)
    if (account) {
      // Sayıyı Türkçe para formatına çevir
      const formattedBalance = account.totalBalance.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      setUpdateForm({ 
        id: account.id, 
        name: account.name, 
        totalBalance: formattedBalance 
      })
      setOpenEdit(true)
    }
  }

  const accounts = useMemo(() => {
    if (!data?.data) return []
    
    return data.data.map(account => ({
      ...account,
      onEdit: handleEdit,
    }))
  }, [data, handleEdit])

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.name.trim()) return
    
    // Para formatından sayıya çevir
    const balanceNumber = parseFloat(createForm.balance.replace(/\./g, '').replace(',', '.')) || 0
    
    try {
      const result = await createAccount({
        ...createForm,
        balance: balanceNumber
      }).unwrap()
      
      // Sadece başarılı sonuçta modal'ı kapat
      if (result && result.type === true) {
        setCreateForm({ name: '', type: AccountType.CASH, currency: CurrencyType.TL, balance: '0' })
        setOpenCreate(false)
        showToast(t('messages.accountCreated'), 'success')
      }
    } catch (error) {
      // Hata durumunda modal açık kalır, kullanıcı düzeltebilir
      console.error('Account creation failed:', error)
      const errorMessage = (error as any)?.data?.message || t('messages.operationFailed')
      showToast(errorMessage, 'error')
    }
  }

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateForm.id) return
    
    // Para formatından sayıya çevir
    const totalBalanceNumber = parseFloat(updateForm.totalBalance.replace(/\./g, '').replace(',', '.')) || 0
    
    try {
      const result = await updateMyAccount({ 
        accountId: updateForm.id, 
        body: { 
          name: updateForm.name, 
          totalBalance: totalBalanceNumber 
        } 
      }).unwrap()
      
      // Sadece başarılı sonuçta modal'ı kapat
      if (result && result.type === true) {
        setUpdateForm({ name: '', totalBalance: '0' })
        setOpenEdit(false)
        showToast(t('messages.accountUpdated'), 'success')
      }
    } catch (error) {
      // Hata durumunda modal açık kalır, kullanıcı düzeltebilir
      console.error('Account update failed:', error)
      const errorMessage = (error as any)?.data?.message || t('messages.operationFailed')
      showToast(errorMessage, 'error')
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.accounts')}</h2>
          <Button onClick={() => setOpenCreate(true)} variant="primary">
            {t('buttons.newAccount')}
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton columns={5} rows={5} />
        ) : (
          <Table 
            data={accounts} 
            columns={columns} 
            title={t('table.titles.accountList')}
            showPagination={true}
            pageSize={10}
          />
        )}

        <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Yeni Hesap"
          footer={(
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpenCreate(false)} variant="secondary">
                İptal
              </Button>
              <Button onClick={submitCreate as unknown as () => void} variant="primary">
                Kaydet
              </Button>
            </div>
          )}
        >
          <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4">
            <Input
              id="name"
              label="Hesap Adı"
              value={createForm.name}
              onChange={(value) => setCreateForm((p) => ({ ...p, name: value as string }))}
              placeholder="Hesap adını giriniz"
              required
              ref={createNameInputRef}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="type"
                label="Hesap Türü"
                value={createForm.type}
                onChange={(value) => setCreateForm((p) => ({ ...p, type: value as AccountType }))}
                options={AccountHelpers.getTypeOptions()}
                placeholder="Tür seçiniz"
                required
              />
              <Select
                id="currency"
                label="Para Birimi"
                value={createForm.currency}
                onChange={(value) => setCreateForm((p) => ({ ...p, currency: value as CurrencyType }))}
                options={Object.values(CurrencyType).map(currency => ({ value: currency, label: currency }))}
                placeholder="Para birimi seçiniz"
                required
              />
            </div>
            <Input
              id="balance"
              label="Başlangıç Bakiyesi"
              value={createForm.balance}
              onChange={(value) => setCreateForm((p) => ({ ...p, balance: value as string }))}
              placeholder="0,00"
              formatCurrency
              currencySymbol="₺"
            />
          </form>
        </Modal>

        <Modal open={openEdit} onClose={() => setOpenEdit(false)} title="Hesabı Düzenle"
          footer={(
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpenEdit(false)} variant="secondary">
                İptal
              </Button>
              <Button onClick={submitUpdate as unknown as () => void} variant="primary">
                Güncelle
              </Button>
            </div>
          )}
        >
          <form onSubmit={submitUpdate} className="grid grid-cols-1 gap-4">
            <Input
              id="editName"
              label="Hesap Adı"
              value={updateForm.name}
              onChange={(value) => setUpdateForm((p) => ({ ...p, name: value as string }))}
              placeholder="Hesap adını giriniz"
              required
              ref={editNameInputRef}
            />
            <Input
              id="totalBalance"
              label="Toplam Bakiye"
              value={updateForm.totalBalance}
              onChange={(value) => setUpdateForm((p) => ({ ...p, totalBalance: value as string }))}
              placeholder="0,00"
              formatCurrency
              currencySymbol="₺"
            />
          </form>
        </Modal>
      </div>
    </div>
  )
}

export default AccountsPage


