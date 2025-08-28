import React from 'react'
import { Table } from '@/components/ui/Table'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useListMonthlyInstallmentsQuery, usePayInstallmentMutation } from '@/services/installmentApi'
import { InstallmentDTOs } from '../../types/installment'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useSearchParams } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { useToast } from '../../hooks/useToast'

// Kısa alias'lar oluştur
type SortablePageRequest = InstallmentDTOs.SortablePageRequest
type ListItem = InstallmentDTOs.ListItem

type InstallmentRow = ListItem

const columnHelper = createColumnHelper<InstallmentRow>()

export const InstallmentsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  // Modal state'leri
  const [paymentModalOpen, setPaymentModalOpen] = React.useState(false)
  const [descriptionModalOpen, setDescriptionModalOpen] = React.useState(false)
  const [selectedInstallment, setSelectedInstallment] = React.useState<InstallmentRow | null>(null)
  const [paymentDate, setPaymentDate] = React.useState('')
  const [description, setDescription] = React.useState('')

  // Sayfalama parametreleri
  const [pageParams, setPageParams] = React.useState<SortablePageRequest>({
    pageNumber: 0,
    pageSize: 10,
    columnName: 'id',
    asc: false
  })

  const now = new Date()
  const [month, setMonth] = React.useState<number>(() => {
    const fromQuery = Number(searchParams.get('month'))
    if (!Number.isNaN(fromQuery) && fromQuery >= 1 && fromQuery <= 12) return fromQuery
    if (typeof window !== 'undefined') {
      const saved = Number(localStorage.getItem('installments.month'))
      if (!Number.isNaN(saved) && saved >= 1 && saved <= 12) return saved
    }
    return now.getMonth() + 1
  })
  const [year, setYear] = React.useState<number>(() => {
    const fromQuery = Number(searchParams.get('year'))
    if (!Number.isNaN(fromQuery) && fromQuery > 1900 && fromQuery < 3000) return fromQuery
    if (typeof window !== 'undefined') {
      const saved = Number(localStorage.getItem('installments.year'))
      if (!Number.isNaN(saved) && saved > 1900 && saved < 3000) return saved
    }
    return now.getFullYear()
  })

  // API hooks
  const { data, isLoading } = useListMonthlyInstallmentsQuery({ month, year, pageData: pageParams })
  const [payInstallment] = usePayInstallmentMutation()

  // Seçimler değiştikçe kaydet
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('installments.month', String(month))
    localStorage.setItem('installments.year', String(year))
    // URL query parametrelerini güncelle
    setSearchParams({ month: String(month), year: String(year) }, { replace: true })
  }, [month, year])

  // History geri/ileri durumunda URL'den state'i güncelle
  React.useEffect(() => {
    const m = Number(searchParams.get('month'))
    const y = Number(searchParams.get('year'))
    if (!Number.isNaN(m) && m >= 1 && m <= 12 && m !== month) setMonth(m)
    if (!Number.isNaN(y) && y > 1900 && y < 3000 && y !== year) setYear(y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Bugünün tarihini formatla (YYYY-MM-DD)
  const today = (() => {
    const now = new Date()
    return now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0')
  })()

  // Modal açma fonksiyonları
  const openPaymentModal = (installment: InstallmentRow) => {
    setSelectedInstallment(installment)
    setPaymentDate(today)
    setPaymentModalOpen(true)
  }

  const openDescriptionModal = (installment: InstallmentRow) => {
    setSelectedInstallment(installment)
    setDescription(installment.descripton || '')
    setDescriptionModalOpen(true)
  }

  // İşlem tipine göre aksiyon butonu metni
  const getActionLabelForType = (type?: string) => {
    switch (type) {
      case 'DEBT':
      case 'PAYMENT':
        return t('buttons.pay')
      case 'CREDIT':
      case 'COLLECTION':
        return t('buttons.collect')
      default:
        return t('buttons.pay')
    }
  }

  // Modal kapatma fonksiyonları
  const closePaymentModal = () => {
    setPaymentModalOpen(false)
    setSelectedInstallment(null)
    setPaymentDate('')
  }

  const closeDescriptionModal = () => {
    setDescriptionModalOpen(false)
    setSelectedInstallment(null)
    setDescription('')
  }

  // Ödeme işlemi
  const handlePayment = async () => {
    if (!selectedInstallment || !paymentDate) return

    try {
      await payInstallment({
        installmentId: selectedInstallment.id,
        data: { paidDate: paymentDate }
      }).unwrap()
      
      showToast(t('installment.paymentSuccess'), 'success')
      closePaymentModal()
    } catch (error) {
      showToast(t('messages.operationFailed'), 'error')
    }
  }

  // Açıklama güncelleme (şimdilik sadece local state'te güncelleniyor)
  const handleDescriptionUpdate = () => {
    if (!selectedInstallment) return
    
    // Burada gerçek API çağrısı yapılacak (şimdilik sadece local state)
    showToast(t('installment.descriptionUpdateSuccess'), 'success')
    closeDescriptionModal()
  }

  // Sayfalama işlemleri
  const handlePageChange = (newPage: number) => {
    setPageParams(prev => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams(prev => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

  // Table bileşeninden gelen sıralama işlevi (sayfalama için)
  const handleSort = (columnName: string, asc: boolean) => {
    setPageParams(prev => ({ ...prev, columnName, asc, pageNumber: 0 }))
  }

  // Sütun sıralama - 3 aşamalı: ASC -> DESC -> Default (id, DESC)
  const handleSortClick = (columnName: string) => {
    setPageParams(prev => {
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

  const monthOptions = Array.from({ length: 12 }).map((_, idx) => {
    const d = new Date(2000, idx, 1)
    const label = i18n.language === 'tr' 
      ? d.toLocaleDateString('tr-TR', { month: 'long' })
      : d.toLocaleDateString('en-US', { month: 'long' })
    return { value: idx + 1, label }
  })

  const yearOptions = Array.from({ length: 14 }).map((_, idx) => {
    const start = year - 3
    const y = start + idx
    return { value: y, label: String(y) }
  })

  const columns = [
    columnHelper.accessor('transaction.name', {
      header: () => (
        <button
          onClick={() => handleSortClick('transaction.name')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.name')}
          {getSortIndicator('transaction.name')}
        </button>
      ),
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('debtDate', {
      header: () => (
        <button
          onClick={() => handleSortClick('debtDate')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.debtDate')}
          {getSortIndicator('debtDate')}
        </button>
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US'),
    }),
    columnHelper.accessor('installmentNumber', {
      header: () => (
        <button
          onClick={() => handleSortClick('installmentNumber')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.installmentNumber')}
          {getSortIndicator('installmentNumber')}
        </button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('amount', {
      header: () => (
        <button
          onClick={() => handleSortClick('amount')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.amount')}
          {getSortIndicator('amount')}
        </button>
      ),
      cell: (info) => info.getValue().toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: 'TRY' }),
    }),
    columnHelper.accessor('paid', {
      header: t('table.columns.paid'),
      cell: (info) => {
        const installment = info.row.original
        if (installment.paid) {
          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-700">
                Ödendi
              </span>
            </div>
          )
        } else {
          return (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:bg-amber-400 border border-amber-200 dark:border-amber-700">
                Bekliyor
              </span>
            </div>
          )
        }
      },
    }),
    columnHelper.accessor('paidDate', {
      header: t('table.columns.paidDate'),
      cell: (info) => {
        const installment = info.row.original
        if (installment.paid && installment.paidDate) {
          return (
            <span className="text-green-600 text-sm">
              {new Date(installment.paidDate).toLocaleDateString('tr-TR')}
            </span>
          )
        } else {
          return (
            <span className="text-gray-400 text-sm">-</span>
          )
        }
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.columns.actions'),
      cell: (info) => {
        const installment = info.row.original
        return (
          <div className="flex gap-2 justify-end">
            {!installment.paid && (
              <Button
                onClick={() => openPaymentModal(installment)}
                variant="secondary"
                className="px-3 py-1 !text-xs !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 hover:!border-green-700 focus:!ring-green-600/50 min-w-[64px] text-center"
              >
                {getActionLabelForType(installment.transaction?.type as string)}
              </Button>
            )}
            <Button
              onClick={() => openDescriptionModal(installment)}
              variant="secondary"
              className="px-3 py-1 text-xs"
            >
              {t('buttons.editDescription')}
            </Button>
          </div>
        )
      },
    }),
  ]

  // Yeni API response yapısına göre veriyi al
  const rows: InstallmentRow[] = data?.data?.content || []

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.installments.monthly')}</h2>
          <div className="flex gap-3 mt-3 w-full items-center">
            <Button 
              onClick={() => {
                setMonth(now.getMonth() + 1)
                setYear(now.getFullYear())
              }}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              {t('pages.installments.thisMonth')}
            </Button>
            
            <Button
              onClick={() => {
                if (month === 1) {
                  setMonth(12)
                  setYear(year - 1)
                } else {
                  setMonth(month - 1)
                }
              }}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              ←
            </Button>
            
            <Select
              id="month"
              value={month}
              onChange={(v) => setMonth(Number(v))}
              options={monthOptions}
              className="sm:w-56"
            />
            <Select
              id="year"
              value={year}
              onChange={(v) => setYear(Number(v))}
              options={yearOptions}
              className="sm:w-48"
            />
            
            <Button
              onClick={() => {
                if (month === 12) {
                  setMonth(1)
                  setYear(year + 1)
                } else {
                  setMonth(month + 1)
                }
              }}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              →
            </Button>
          </div>
        </div>

        {/* Sıralama Durumu Bilgisi */}
        {/* {pageParams.columnName !== 'id' && (
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
        )} */}

        <Table 
          data={rows} 
          columns={columns} 
          title={t('table.titles.installmentList')}
          showPagination={true}
          pageSize={pageParams.pageSize}
          currentPage={pageParams.pageNumber}
          totalPages={data?.data?.totalPages || 0}
          totalRecords={data?.data?.totalElements || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
          sortColumn={pageParams.columnName}
          sortDirection={pageParams.asc ? 'asc' : 'desc'}
          isFirstPage={data?.data?.first}
          isLastPage={data?.data?.last}
        />
        {isLoading && (
          <div className="mt-3 text-sm text-slate-500 dark:text-mm-subtleText">{t('common.loading')}</div>
        )}
      </div>

      {/* Ödeme Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        title={t('modals.payInstallment')}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closePaymentModal}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="primary" onClick={handlePayment}>
              {t('buttons.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-mm-subtleText">
            {t('installment.selectPaymentDate')}
          </p>
          <DatePicker
            id="paymentDate"
            value={paymentDate}
            onChange={setPaymentDate}
            label={t('installment.paymentDate')}
            required
            usePortal
            dropdownZIndex={10050}
          />
        </div>
      </Modal>

      {/* Açıklama Düzenleme Modal */}
      <Modal
        open={descriptionModalOpen}
        onClose={closeDescriptionModal}
        title={t('modals.editInstallmentDescription')}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={closeDescriptionModal}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="primary" onClick={handleDescriptionUpdate}>
              {t('buttons.save')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-mm-subtleText">
            {t('installment.enterDescription')}
          </p>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(value) => setDescription(String(value))}
            label={t('installment.description')}
            placeholder={t('placeholders.note')}
          />
        </div>
      </Modal>
    </div>
  )
}

export default InstallmentsPage


