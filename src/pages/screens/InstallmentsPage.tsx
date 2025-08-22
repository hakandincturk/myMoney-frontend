import React from 'react'
import { Table } from '@/components/ui/Table'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useListMonthlyInstallmentsQuery, usePayInstallmentMutation } from '@/services/installmentApi'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useSearchParams } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { useToast } from '../../hooks/useToast'

type InstallmentRow = {
  id: number
  transactionName: string
  amount: number
  date: string
  installmentNumber: number
  paid: boolean
  paidDate?: string
  description?: string
}

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
  const { data, isLoading } = useListMonthlyInstallmentsQuery({ month, year })
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
    setDescription(installment.description || '')
    setDescriptionModalOpen(true)
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
    columnHelper.accessor('transactionName', {
      header: t('table.columns.name'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('date', {
      header: t('table.columns.date'),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US'),
    }),
    columnHelper.accessor('installmentNumber', {
      header: t('table.columns.installmentNumber'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('amount', {
      header: t('table.columns.amount'),
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
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
    columnHelper.accessor('id', {
      header: t('table.columns.actions'),
      cell: (info) => {
        const installment = info.row.original
        return (
          <div className="flex gap-2 justify-end">
            {!installment.paid && (
              <Button
                onClick={() => openPaymentModal(installment)}
                variant="secondary"
                className="px-3 py-1 !text-xs !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 hover:!border-green-700 focus:!ring-green-600/50"
              >
                {t('buttons.pay')}
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

  const rows: InstallmentRow[] = (data?.data || []).map((x) => ({
    id: x.id,
    transactionName: x.transactionDetail?.name || "-",
    amount: x.amount,
    date: x.date,
    installmentNumber: x.installmentNumber,
    paid: x.paid,
    paidDate: x.paidDate,
    description: x.descripton,
  }))

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.installments')}</h2>
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

        <Table 
          data={rows} 
          columns={columns} 
          title={t('table.titles.installmentList')}
          showPagination={true}
          pageSize={10}
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


