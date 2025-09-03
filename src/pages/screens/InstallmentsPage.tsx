import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { FilterChips } from '@/components/ui/FilterChips'
import { useListMonthlyInstallmentsQuery, usePayInstallmentMutation } from '@/services/installmentApi'
import { InstallmentDTOs } from '../../types/installment'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import StatusBadge from '@/components/ui/StatusBadge'
import { TransactionStatus } from '../../enums'

// Kısa alias'lar oluştur
type FilterRequest = InstallmentDTOs.FilterRequest
type ListItem = InstallmentDTOs.ListItem

type InstallmentRow = ListItem

const columnHelper = createColumnHelper<InstallmentRow>()

export const InstallmentsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL'den filtreleri oku
  const loadFiltersFromURL = useCallback((): FilterRequest => {
    const params = new URLSearchParams(searchParams)
    
    const result = {
      pageNumber: parseInt(params.get('page') || '0') || 0,
      pageSize: parseInt(params.get('size') || '10') || 10,
      columnName: params.get('sort') || 'id',
      asc: params.get('direction') === 'asc',
      month: parseInt(params.get('month') || '') || undefined,
      year: parseInt(params.get('year') || '') || undefined,
      transactionName: params.get('transactionName') || '',
      description: params.get('description') || '',
      minTotalAmount: params.get('minTotalAmount') ? Number(params.get('minTotalAmount')) || undefined : undefined,
      maxTotalAmount: params.get('maxTotalAmount') ? Number(params.get('maxTotalAmount')) || undefined : undefined,
      isPaid: params.get('isPaid') ? params.get('isPaid')!.split(',').map(v => v === 'true') : undefined,
      paidStartDate: params.get('paidStartDate') || '',
      paidEndDate: params.get('paidEndDate') || ''
    }
    
    return result
  }, [searchParams])

  // Filtreleri URL'ye yaz
  const syncFiltersToURL = useCallback((filters: FilterRequest) => {
    const params = new URLSearchParams()
    
    // Sadece boş olmayan değerleri URL'ye ekle
    if (filters.pageNumber && filters.pageNumber > 0) params.set('page', filters.pageNumber.toString())
    if (filters.pageSize && filters.pageSize !== 10) params.set('size', filters.pageSize.toString())
    if (filters.columnName && filters.columnName !== 'id') params.set('sort', filters.columnName)
    if (filters.asc !== undefined && filters.asc !== false) params.set('direction', 'asc')
    if (filters.month && filters.month > 0) params.set('month', filters.month.toString())
    if (filters.year && filters.year > 0) params.set('year', filters.year.toString())
    if (filters.transactionName && filters.transactionName.trim()) params.set('transactionName', filters.transactionName.trim())
    if (filters.description && filters.description.trim()) params.set('description', filters.description.trim())
    if (filters.minTotalAmount && filters.minTotalAmount > 0) params.set('minTotalAmount', filters.minTotalAmount.toString())
    if (filters.maxTotalAmount && filters.maxTotalAmount > 0) params.set('maxTotalAmount', filters.maxTotalAmount.toString())
    if (filters.isPaid && filters.isPaid.length > 0) params.set('isPaid', filters.isPaid.join(','))
    if (filters.paidStartDate && filters.paidStartDate.trim()) params.set('paidStartDate', filters.paidStartDate.trim())
    if (filters.paidEndDate && filters.paidEndDate.trim()) params.set('paidEndDate', filters.paidEndDate.trim())
    
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  // Varsayılan ay/yıl değerlerini belirle
  const now = new Date()
  const defaultMonth = now.getMonth() + 1
  const defaultYear = now.getFullYear()

  // Filter parametreleri - URL'den yüklenecek
  const [filterParams, setFilterParams] = useState<FilterRequest>(() => {
    const urlFilters = loadFiltersFromURL()
    // Eğer ay/yıl URL'de yoksa varsayılan değerleri kullan
    return {
      ...urlFilters,
      month: urlFilters.month || defaultMonth,
      year: urlFilters.year || defaultYear
    }
  })

  // Filter modal state'i
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  
  // Uygulanan filtreler state'i (tablo üstünde gösterilecek) - URL'den yüklenecek
  const [appliedFilters, setAppliedFilters] = useState<FilterRequest>(() => {
    const urlFilters = loadFiltersFromURL()
    return {
      ...urlFilters,
      month: urlFilters.month || defaultMonth,
      year: urlFilters.year || defaultYear
    }
  })

  // URL değişikliklerini dinle (geri/ileri butonları için)
  useEffect(() => {
    const urlFilters = loadFiltersFromURL()
    const updatedFilters = {
      ...urlFilters,
      month: urlFilters.month || defaultMonth,
      year: urlFilters.year || defaultYear
    }
    setFilterParams(updatedFilters)
    setAppliedFilters(updatedFilters)
  }, [loadFiltersFromURL, defaultMonth, defaultYear])

  // API hooks
  const { data, isLoading, error } = useListMonthlyInstallmentsQuery(appliedFilters, {
    // Parametre değiştiğinde mutlaka yeniden istekte bulun
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
  })
  const [payInstallment] = usePayInstallmentMutation()

  // Listeleme hatasında toast göster
  useEffect(() => {
    if (error) {
      const errData = (error as any)?.data
      const message = errData?.message || t('messages.operationFailed')
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type: 'error' } })) } catch(_) {}
    }
  }, [error, t])

  // Modal state'leri
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentRow | null>(null)
  const [paymentDate, setPaymentDate] = useState('')

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

  // Ödeme işlemi
  const handlePayment = async () => {
    if (!selectedInstallment || !paymentDate) return

    try {
      await payInstallment({
        installmentId: selectedInstallment.id,
        data: { paidDate: paymentDate }
      }).unwrap()
      
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('installment.paymentSuccess'), type: 'success' } })) } catch(_) {}
      closePaymentModal()
    } catch (error) {
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('messages.operationFailed'), type: 'error' } })) } catch(_) {}
    }
  }

  // Sayfalama işlemleri
  const handlePageChange = (newPage: number) => {
    const newParams = { ...appliedFilters, pageNumber: newPage }
    setAppliedFilters(newParams)
    // URL'yi güncelle
    syncFiltersToURL(newParams)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...appliedFilters, pageSize: newPageSize, pageNumber: 0 }
    setAppliedFilters(newParams)
    // URL'yi güncelle
    syncFiltersToURL(newParams)
  }

  // Filter işlemleri
  const handleFilterChange = (key: keyof FilterRequest, value: any) => {
    // 0 değerlerini undefined olarak set et (ay/yıl hariç)
    if ((key !== 'month' && key !== 'year') && (value === 0 || value === '0')) {
      setFilterParams(prev => ({ ...prev, [key]: undefined }))
    } else {
      setFilterParams(prev => ({ ...prev, [key]: value }))
    }
  }

  const applyFilters = () => {
    // Filter parametrelerini sayfalama parametreleriyle birleştir
    const combinedParams: FilterRequest = {
      ...filterParams,
      pageNumber: 0, // Filter uygulandığında ilk sayfaya dön
    }

    // Tutar alanlarını backend uyumlu sayıya çevir (virgül/nokta normalize)
    const parseAmount = (amount: any): number | undefined => {
      if (amount === undefined) return undefined
      const raw = String(amount)
      const normalized = raw.replace(/\./g, '').replace(',', '.')
      const parsedAmount = Number(normalized)
      return isNaN(parsedAmount) || parsedAmount === 0 ? undefined : parsedAmount
    }

    combinedParams.minTotalAmount = parseAmount(combinedParams.minTotalAmount)
    combinedParams.maxTotalAmount = parseAmount(combinedParams.maxTotalAmount)
    
    // Boş değerleri temizle (ay/yıl hariç)
    Object.keys(combinedParams).forEach(key => {
      const k = key as keyof FilterRequest
      if (k !== 'month' && k !== 'year' && (combinedParams[k] === '' || combinedParams[k] === undefined)) {
        delete combinedParams[k]
      }
    })

    // Uygulanan filtre özetini güncelle
    setAppliedFilters(combinedParams)
    setFilterModalOpen(false)
    
    // URL'yi güncelle
    syncFiltersToURL(combinedParams)
  }

  const clearFilters = () => {
    const defaultFilters: FilterRequest = {
      pageNumber: 0,
      pageSize: 10,
      columnName: 'id',
      asc: false,
      month: defaultMonth,
      year: defaultYear,
      transactionName: '',
      description: '',
      minTotalAmount: undefined,
      maxTotalAmount: undefined,
      isPaid: undefined,
      paidStartDate: '',
      paidEndDate: ''
    }
    
    setFilterParams(defaultFilters)
    setAppliedFilters(defaultFilters)
    
    // URL'yi temizle
    syncFiltersToURL(defaultFilters)
  }

  const hasActiveFilters = () => {
    // Ay/yıl dışında aktif filtre var mı kontrol et
    const hasTransactionName = filterParams.transactionName && filterParams.transactionName.trim() !== ''
    const hasDescription = filterParams.description && filterParams.description.trim() !== ''
    const hasMinTotalAmount = filterParams.minTotalAmount && filterParams.minTotalAmount > 0
    const hasMaxTotalAmount = filterParams.maxTotalAmount && filterParams.maxTotalAmount > 0
    const hasIsPaid = filterParams.isPaid && filterParams.isPaid.length > 0
    const hasPaidStartDate = filterParams.paidStartDate && filterParams.paidStartDate.trim() !== ''
    const hasPaidEndDate = filterParams.paidEndDate && filterParams.paidEndDate.trim() !== ''

    return hasTransactionName || hasDescription || hasMinTotalAmount || hasMaxTotalAmount || hasIsPaid || hasPaidStartDate || hasPaidEndDate
  }

  // Uygulanan filtrelerde aktif olan var mı?
  const hasAppliedActiveFilters = () => {
    const hasTransactionName = appliedFilters.transactionName && appliedFilters.transactionName.trim() !== ''
    const hasDescription = appliedFilters.description && appliedFilters.description.trim() !== ''
    const hasMinTotalAmount = typeof appliedFilters.minTotalAmount === 'number' && appliedFilters.minTotalAmount > 0
    const hasMaxTotalAmount = typeof appliedFilters.maxTotalAmount === 'number' && appliedFilters.maxTotalAmount > 0
    const hasIsPaid = appliedFilters.isPaid && appliedFilters.isPaid.length > 0
    const hasPaidStartDate = appliedFilters.paidStartDate && appliedFilters.paidStartDate.trim() !== ''
    const hasPaidEndDate = appliedFilters.paidEndDate && appliedFilters.paidEndDate.trim() !== ''

    return hasTransactionName || hasDescription || hasMinTotalAmount || hasMaxTotalAmount || hasIsPaid || hasPaidStartDate || hasPaidEndDate
  }

  // Üst bardan chip kaldırma
  const removeAppliedFilter = (key: keyof FilterRequest) => {
    const nextApplied: FilterRequest = { ...appliedFilters }
    const nextFilter: FilterRequest = { ...filterParams }

    if (key === 'transactionName' || key === 'description' || key === 'paidStartDate' || key === 'paidEndDate') {
      (nextApplied as any)[key] = ''
      ;(nextFilter as any)[key] = ''
    } else {
      (nextApplied as any)[key] = undefined
      ;(nextFilter as any)[key] = undefined
    }

    setAppliedFilters(nextApplied)
    setFilterParams(nextFilter)

    // Sayfayı başa al ve yeni parametrelerle isteği tetikle
    const refreshedParams = {
      ...nextApplied,
      pageNumber: 0
    }
    // Boş değerleri tamamen kaldır
    if (refreshedParams[key] === '' || refreshedParams[key] === undefined) {
      delete refreshedParams[key]
    }
    
    // URL'yi güncelle
    syncFiltersToURL(refreshedParams)
  }

  // Çoklu seçimli filtrelerden tek bir öğeyi kaldır
  const removeAppliedFilterItem = (key: string, value: any) => {
    const nextApplied: FilterRequest = { ...appliedFilters }
    const nextFilter: FilterRequest = { ...filterParams }

    const current = (nextApplied as any)[key] as any[] | undefined
    const filtered = (current || []).filter((v) => v !== value)

    if (filtered.length > 0) {
      ;(nextApplied as any)[key] = filtered
      ;(nextFilter as any)[key] = filtered
    } else {
      ;(nextApplied as any)[key] = undefined
      ;(nextFilter as any)[key] = undefined
    }

    setAppliedFilters(nextApplied)
    setFilterParams(nextFilter)

    const refreshedParams: any = {
      ...nextApplied,
      pageNumber: 0
    }
    if (filtered.length > 0) {
      refreshedParams[key] = filtered
    } else {
      delete refreshedParams[key]
    }
    
    // URL'yi güncelle
    syncFiltersToURL(refreshedParams)
  }

  // Table bileşeninden gelen sıralama işlevi
  const handleSort = (columnName: string, asc: boolean) => {
    const newParams = { ...appliedFilters, columnName, asc, pageNumber: 0 }
    setAppliedFilters(newParams)
    // URL'yi güncelle
    syncFiltersToURL(newParams)
  }

  // Sütun sıralama - 3 aşamalı: ASC -> DESC -> Default (id, DESC)
  const handleSortClick = (columnName: string) => {
    const newParams = { ...appliedFilters }
      // Eğer aynı sütuna tıklanıyorsa
    if (newParams.columnName === columnName) {
      if (newParams.asc === true) {
          // ASC -> DESC
        newParams.asc = false
      } else if (newParams.asc === false) {
          // DESC -> Default (id, DESC)
        newParams.columnName = 'id'
        newParams.asc = false
        newParams.pageNumber = 0
      }
    } else {
      // Farklı sütuna tıklanıyorsa -> ASC
      newParams.columnName = columnName
      newParams.asc = true
      newParams.pageNumber = 0
    }
    
    setAppliedFilters(newParams)
    // URL'yi güncelle
    syncFiltersToURL(newParams)
  }

  // Sıralama durumunu göster
  const getSortIndicator = (columnName: string) => {
    if (appliedFilters.columnName !== columnName) return null
    
    if (appliedFilters.asc) {
      return <span className="text-xs font-bold text-blue-600">↑</span>
    } else {
      return <span className="text-xs font-bold text-red-600">↓</span>
    }
  }

  // Ay/yıl değişikliklerini hızlı uygula
  const setMonthYear = (month: number, year: number) => {
    const newParams = { ...appliedFilters, month, year, pageNumber: 0 }
    setFilterParams(newParams)
    setAppliedFilters(newParams)
    syncFiltersToURL(newParams)
  }

  const monthOptions = Array.from({ length: 12 }).map((_, idx) => {
    const d = new Date(2000, idx, 1)
    const label = i18n.language === 'tr' 
      ? d.toLocaleDateString('tr-TR', { month: 'long' })
      : d.toLocaleDateString('en-US', { month: 'long' })
    return { value: idx + 1, label }
  })

  const yearOptions = Array.from({ length: 14 }).map((_, idx) => {
    const start = (appliedFilters.year || defaultYear) - 3
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
      meta: {
        className: 'min-w-[160px]'
      }
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
      cell: (info) => new Date(info.getValue()).toLocaleDateString(
        i18n.language === 'tr' ? 'tr-TR' : 'en-US',
        { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }
      ),
      meta: {
        className: 'min-w-[120px]'
      }
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
      cell: (info) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {info.getValue()}. {t('installment.installment')}
        </span>
      ),
      meta: {
        className: 'min-w-[100px] text-center'
      }
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
      cell: (info) => (
        <span className="font-semibold">
          ₺{Number(info.getValue() || 0).toLocaleString('tr-TR')}
        </span>
      ),
      meta: {
        className: 'min-w-[120px] text-right'
      }
    }),
    columnHelper.accessor('paid', {
      header: t('table.columns.paid'),
      cell: (info) => {
        const installment = info.row.original
        const status = installment.paid ? TransactionStatus.PAID : TransactionStatus.PENDING
        return <StatusBadge status={status} />
      },
      meta: {
        className: 'min-w-[100px] text-center'
      }
    }),
    columnHelper.accessor('paidDate', {
      header: t('table.columns.paidDate'),
      cell: (info) => {
        const installment = info.row.original
        if (installment.paid && installment.paidDate) {
          return (
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">
              {new Date(installment.paidDate).toLocaleDateString(
                i18n.language === 'tr' ? 'tr-TR' : 'en-US',
                { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }
              )}
            </span>
          )
        } else {
          return (
            <span className="text-gray-400 text-sm">-</span>
          )
        }
      },
      meta: {
        className: 'min-w-[120px] text-center'
      }
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
          </div>
        )
      },
      meta: {
        className: 'min-w-[100px]'
      }
    }),
  ]

  // Yeni API response yapısına göre veriyi al
  const rows: InstallmentRow[] = data?.data?.content || []

  // Para formatını ("3.000,50" gibi) Java/BigDecimal uyumlu sayıya çevir
  const parseCurrencyToNumber = useCallback((input: any): number | undefined => {
    if (input === undefined || input === null) return undefined
    if (typeof input === 'number') return input
    if (typeof input === 'string') {
      const normalized = input
        .replace(/\./g, '') // binlik ayıracı kaldır
        .replace(/,/g, '.') // ondalığı noktaya çevir
        .replace(/[^0-9.\-]/g, '') // kalan harf/simge temizle
      const num = Number(normalized)
      return isNaN(num) ? undefined : num
    }
    return undefined
  }, [])

  const handleRemoveKey = (key: any) => removeAppliedFilter(key as keyof FilterRequest)

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.installments.monthly')}</h2>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setFilterModalOpen(true)}
              variant="secondary"
              className={`${hasActiveFilters() ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700' : ''}`}
            >
              {t('buttons.filter')}
              {hasActiveFilters() && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                  {(() => {
                    // Sadece gerçekten aktif olan filtreleri say
                    let count = 0
                    if (filterParams.transactionName && filterParams.transactionName.trim() !== '') count++
                    if (filterParams.description && filterParams.description.trim() !== '') count++
                    if (filterParams.minTotalAmount && filterParams.minTotalAmount > 0) count++
                    if (filterParams.maxTotalAmount && filterParams.maxTotalAmount > 0) count++
                    if (filterParams.isPaid && filterParams.isPaid.length > 0) count++
                    if (filterParams.paidStartDate && filterParams.paidStartDate.trim() !== '') count++
                    if (filterParams.paidEndDate && filterParams.paidEndDate.trim() !== '') count++
                    return count
                  })()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Ay/Yıl Seçici */}
        <div className="flex gap-3 mb-4 w-full items-center">
          <Button 
            onClick={() => setMonthYear(defaultMonth, defaultYear)}
            variant="secondary"
            className="px-3 py-2 text-sm"
          >
            {t('pages.installments.thisMonth')}
            </Button>
            
            <Button
              onClick={() => {
              const currentMonth = appliedFilters.month || defaultMonth
              const currentYear = appliedFilters.year || defaultYear
              if (currentMonth === 1) {
                setMonthYear(12, currentYear - 1)
                } else {
                setMonthYear(currentMonth - 1, currentYear)
                }
              }}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              ←
            </Button>
            
            <Select
              id="month"
            value={appliedFilters.month || defaultMonth}
            onChange={(v) => setMonthYear(Number(v), appliedFilters.year || defaultYear)}
              options={monthOptions}
              className="sm:w-56"
            />
            <Select
              id="year"
            value={appliedFilters.year || defaultYear}
            onChange={(v) => setMonthYear(appliedFilters.month || defaultMonth, Number(v))}
              options={yearOptions}
              className="sm:w-48"
            />
            
            <Button
              onClick={() => {
              const currentMonth = appliedFilters.month || defaultMonth
              const currentYear = appliedFilters.year || defaultYear
              if (currentMonth === 12) {
                setMonthYear(1, currentYear + 1)
                } else {
                setMonthYear(currentMonth + 1, currentYear)
                }
              }}
              variant="secondary"
              className="px-3 py-2 text-sm"
            >
              →
            </Button>
        </div>

        {/* Uygulanan Akıllı Filtre Özeti - Tablo üstünde göster */}
        {hasAppliedActiveFilters() && (
          <FilterChips
            appliedFilters={appliedFilters}
            onRemoveKey={handleRemoveKey}
            onRemoveItem={removeAppliedFilterItem}
            accountIdToName={{}}
            contactIdToName={{}}
            getTypeLabel={() => ''}
          />
        )}

        {isLoading ? (
          <TableSkeleton columns={6} rows={5} />
        ) : (
        <Table 
          data={rows} 
          columns={columns} 
          title={t('table.titles.installmentList')}
          showPagination={true}
            pageSize={appliedFilters.pageSize || 10}
            currentPage={appliedFilters.pageNumber || 0}
          totalPages={data?.data?.totalPages || 0}
          totalRecords={data?.data?.totalElements || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
            sortColumn={appliedFilters.columnName}
            sortDirection={appliedFilters.asc ? 'asc' : 'desc'}
          isFirstPage={data?.data?.first}
          isLastPage={data?.data?.last}
        />
        )}

        {/* Filter Modal */}
        <Modal
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          title={t('modals.filter')}
          size="lg"
          zIndex={10000}
          footer={
            <div className="flex gap-3 justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{t('filters.activeFilters')}:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {(() => {
                    // Sadece gerçekten aktif olan filtreleri say
                    let count = 0
                    if (filterParams.transactionName && filterParams.transactionName.trim() !== '') count++
                    if (filterParams.description && filterParams.description.trim() !== '') count++
                    if (filterParams.minTotalAmount && filterParams.minTotalAmount > 0) count++
                    if (filterParams.maxTotalAmount && filterParams.maxTotalAmount > 0) count++
                    if (filterParams.isPaid && filterParams.isPaid.length > 0) count++
                    if (filterParams.paidStartDate && filterParams.paidStartDate.trim() !== '') count++
                    if (filterParams.paidEndDate && filterParams.paidEndDate.trim() !== '') count++
                    return count
                  })()}
                </span>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={clearFilters}>
                  {t('buttons.clearAll')}
                </Button>
                <Button variant="primary" onClick={applyFilters}>
                  {t('buttons.applyFilters')}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Basic Filters Section */}
            <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('filters.basicFilters')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="filterTransactionName"
                  label={t('filters.transactionName')}
                  value={filterParams.transactionName || ''}
                  onChange={(value) => handleFilterChange('transactionName', value)}
                  placeholder={t('placeholders.searchByTransactionName')}
                  className="md:col-span-2"
                />
                
                <Input
                  id="filterDescription"
                  label={t('filters.description')}
                  value={filterParams.description || ''}
                  onChange={(value) => handleFilterChange('description', value)}
                  placeholder={t('placeholders.searchByDescription')}
                  className="md:col-span-2"
                />

                <Input
                  id="filterMinTotalAmount"
                  label={t('filters.minTotalAmount')}
                  value={filterParams.minTotalAmount || ''}
                  onChange={(value) => handleFilterChange('minTotalAmount', value)}
                  placeholder="0,00"
                  formatCurrency
                  currencySymbol="₺"
                />

                <Input
                  id="filterMaxTotalAmount"
                  label={t('filters.maxTotalAmount')}
                  value={filterParams.maxTotalAmount || ''}
                  onChange={(value) => handleFilterChange('maxTotalAmount', value)}
                  placeholder="0,00"
                  formatCurrency
                  currencySymbol="₺"
                />

                <Select
                  id="filterIsPaid"
                  label={t('filters.paymentStatus')}
                  value={(filterParams.isPaid || []).map(v => (v ? 'true' : 'false'))}
                  onChange={(value) => {
                    const arr = Array.isArray(value) ? value : [value]
                    const mapped = arr.map(v => String(v) === 'true')
                    handleFilterChange('isPaid', mapped)
                  }}
                  options={[
                    { value: 'true', label: t('status.paid') },
                    { value: 'false', label: t('status.pending') }
                  ]}
                  placeholder={t('placeholders.selectPaymentStatus')}
                  isMulti
                  closeMenuOnSelect={false}
                  className="md:col-span-2"
                />
              </div>
      </div>

            {/* Date Filters Section */}
            <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('filters.paidDateFilters')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DatePicker
                  id="filterPaidStartDate"
                  label={t('filters.paidStartDate')}
                  value={filterParams.paidStartDate || ''}
                  onChange={(value) => handleFilterChange('paidStartDate', value)}
                  placeholder={t('placeholders.selectPaidStartDate')}
                />
                
                <DatePicker
                  id="filterPaidEndDate"
                  label={t('filters.paidEndDate')}
                  value={filterParams.paidEndDate || ''}
                  onChange={(value) => handleFilterChange('paidEndDate', value)}
                  placeholder={t('placeholders.selectPaidEndDate')}
                />
              </div>
            </div>
          </div>
        </Modal>

      {/* Ödeme Modal */}
      <Modal
        open={paymentModalOpen}
        onClose={closePaymentModal}
        title={t('modals.payInstallment')}
          size="sm"
          zIndex={10001}
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
        </div>
    </div>
  )
}

export default InstallmentsPage