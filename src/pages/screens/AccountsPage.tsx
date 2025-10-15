import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { AccountType, CurrencyType, useCreateAccountMutation, useListMyActiveAccountsQuery, useUpdateMyAccountMutation } from '@/services/accountApi'
import { AccountDTOs } from '../../types'
import { AccountHelpers } from '../../types'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../hooks/useToast'

// Kısa alias'lar oluştur
type SortablePageRequest = AccountDTOs.SortablePageRequest
type ListItem = AccountDTOs.ListItem

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
  
  // Sayfalama parametreleri
  const [pageParams, setPageParams] = useState<SortablePageRequest>({
    pageNumber: 0,
    pageSize: 10,
    columnName: 'id',
    asc: false
  })
  
  const { data, isLoading } = useListMyActiveAccountsQuery(pageParams, {
    // Mount olduğunda ve arg değiştiğinde mutlaka refetch yap
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
  })
  
  const [createAccount] = useCreateAccountMutation()
  const [updateMyAccount] = useUpdateMyAccountMutation()
  const { showToast } = useToast()
  
  // Modal açıldığında ilk input'a focus olmak için ref'ler
  const createNameInputRef = useRef<HTMLInputElement>(null)
  const editNameInputRef = useRef<HTMLInputElement>(null)

  // Sayfalama işlemleri
  const handlePageChange = (newPage: number) => {
    setPageParams((prev: SortablePageRequest) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev: SortablePageRequest) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }


  // Sütun sıralama - 3 aşamalı: ASC -> DESC -> Default (id, DESC)
  const handleSortClick = (columnName: string) => {
    setPageParams((prev: SortablePageRequest) => {
      // Eğer aynı sütuna tıklanıyorsa
      if (prev.columnName === columnName) {
        if (prev.asc === true) {
          // ASC -> DESC
          return { ...prev, asc: false }
        } else if (prev.asc === false) {
          // DESC -> Default (id, DESC)
          return { ...prev, columnName: 'id', asc: false, pageNumber: 0 }
        }
      }
      
      // Farklı sütuna tıklanıyorsa -> ASC
      return { ...prev, columnName, asc: true, pageNumber: 0 }
    })
  }

  // Sıralama durumunu göster
  const getSortIndicator = (columnName: string) => {
    if (pageParams.columnName !== columnName) return null
    
    if (pageParams.asc) {
      return <span className="text-xs font-bold text-blue-600">↑</span>
    } else {
      return <span className="text-xs font-bold text-red-600">↓</span>
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: () => (
        <button
          onClick={() => handleSortClick('name')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.name')}
          {getSortIndicator('name')}
        </button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('type', {
      header: () => (
        <button
          onClick={() => handleSortClick('type')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.type')}
          {getSortIndicator('type')}
        </button>
      ),
      cell: (info) => AccountHelpers.getTypeText(info.getValue()),
    }),
    columnHelper.accessor('currency', {
      header: () => (
        <button
          onClick={() => handleSortClick('currency')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.currency')}
          {getSortIndicator('currency')}
        </button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('balance', {
      header: () => (
        <button
          onClick={() => handleSortClick('balance')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.balance')}
          {getSortIndicator('balance')}
        </button>
      ),
      cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
    }),
    columnHelper.accessor('totalBalance', {
      header: () => (
        <button
          onClick={() => handleSortClick('totalBalance')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.totalBalance')}
          {getSortIndicator('totalBalance')}
        </button>
      ),
      cell: (info) => `₺${info.getValue().toLocaleString('tr-TR')}`,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.columns.actions'),
      cell: (info) => (
        <div className="flex items-center justify-end">
          <Button 
            onClick={() => info.row.original.onEdit?.(info.row.original.id)} 
            variant="primary"
            className="px-3 py-1.5 text-sm"
          >
            {t('buttons.edit')}
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
    const account = accounts.find((a: Account) => a.id === id)
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
    if (!data?.data?.content) return []
    
    return data.data.content.map((account: ListItem) => ({
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
  <div className="h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0 flex flex-col min-h-0 box-border">
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.accounts')}</h2>
          <Button onClick={() => setOpenCreate(true)} variant="primary">
            {t('buttons.newAccount')}
          </Button>
        </div>

        {/* Sıralama Durumu Bilgisi */}
        {pageParams.columnName !== 'id' && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Sıralama:</span>
              <span className="capitalize">{pageParams.columnName}</span>
              <span className="font-bold">
                {pageParams.asc ? '↑ Artan' : '↓ Azalan'}
              </span>
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>Bir kez daha tıklayarak varsayılan sıralamaya dön</span>
            </div>
          </div>
        )}

  <div className="flex-1 flex flex-col min-h-0">
          {isLoading ? (
            <TableSkeleton columns={5} rows={5} />
          ) : (
            <Table 
              data={accounts} 
              columns={columns} 
              title={t('table.titles.accountList')}
              showPagination={true}
              pageSize={pageParams.pageSize}
              currentPage={pageParams.pageNumber}
              totalPages={data?.data?.totalPages || 0}
              totalRecords={data?.data?.totalElements || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isFirstPage={data?.data?.first}
              isLastPage={data?.data?.last}
              className="h-full"
            />
          )}
        </div>

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


