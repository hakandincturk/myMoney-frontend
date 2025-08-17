import React, { useMemo, useState } from 'react'
import { AccountType, CurrencyType, useCreateAccountMutation, useListMyActiveAccountsQuery, useUpdateMyAccountMutation } from '@/services/accountApi'
import { AccountHelpers } from '../../types'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createColumnHelper } from '@tanstack/react-table'

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

const columns = [
  columnHelper.accessor('name', {
    header: 'Ad',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('type', {
    header: 'Tür',
    cell: (info) => AccountHelpers.getTypeText(info.getValue()),
  }),
  columnHelper.accessor('currency', {
    header: 'Para Birimi',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('balance', {
    header: 'Bakiye',
    cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
  }),
  columnHelper.accessor('totalBalance', {
    header: 'Toplam',
    cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Düzenle',
    cell: (info) => (
      <div className="flex items-center justify-end">
        <Button 
          onClick={() => info.row.original.onEdit?.(info.row.original.id)} 
          variant="primary"
          className="px-3 py-1.5 text-sm"
        >
          Düzenle
        </Button>
      </div>
    ),
  }),
]

export const AccountsPage: React.FC = () => {
  const { data } = useListMyActiveAccountsQuery()
  const [createAccount] = useCreateAccountMutation()
  const [updateMyAccount] = useUpdateMyAccountMutation()
  
  const [createForm, setCreateForm] = useState({
    name: '',
    type: AccountType.CASH as AccountType,
    currency: CurrencyType.TL as CurrencyType,
    balance: '0',
  })
  const [updateForm, setUpdateForm] = useState<{ id?: number; name: string; totalBalance: string }>({ name: '', totalBalance: '0' })
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)

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
    
    await createAccount({
      ...createForm,
      balance: balanceNumber
    })
    setCreateForm({ name: '', type: AccountType.CASH, currency: CurrencyType.TL, balance: '0' })
    setOpenCreate(false)
  }

  const submitUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateForm.id) return
    
    // Para formatından sayıya çevir
    const totalBalanceNumber = parseFloat(updateForm.totalBalance.replace(/\./g, '').replace(',', '.')) || 0
    
    await updateMyAccount({ 
      accountId: updateForm.id, 
      body: { 
        name: updateForm.name, 
        totalBalance: totalBalanceNumber 
      } 
    })
    setUpdateForm({ name: '', totalBalance: '0' })
    setOpenEdit(false)
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">Hesaplar</h2>
          <Button onClick={() => setOpenCreate(true)} variant="primary">
            Yeni Hesap
          </Button>
        </div>

        <Table 
          data={accounts} 
          columns={columns} 
          title="Hesap Listesi"
          showPagination={accounts.length > 10}
          pageSize={10}
        />

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


