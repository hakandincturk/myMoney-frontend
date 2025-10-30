import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TableSkeleton, FormFieldSkeleton } from '@/components/ui/Skeleton'
import { useCreateTransactionMutation, useListMyTransactionsQuery, useDeleteTransactionMutation, useListTransactionInstallmentsQuery, TransactionType, TransactionStatus } from '@/services/transactionApi'
import { usePayInstallmentsMutation } from '@/services/installmentApi'
import { TransactionHelpers, TransactionDTOs, AccountDTOs } from '../../types'
import type { ListMyContactsResponseDto } from '@/services/contactApi'

import { useListMyActiveAccountsQuery } from '@/services/accountApi'
import { useListMyActiveContactsQuery, SortablePageRequest as ContactSortablePageRequest } from '@/services/contactApi'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
// Toast gösterimi için App seviyesindeki ToastContainer ile çalışan yardımcı
import { FilterChips } from '@/components/ui/FilterChips'
import { AccountType } from '@/enums/account'
import { useListMyActiveCategoriesQuery } from '@/services/categoryApi'

// Dummy veriler kaldırıldı; tablo gerçek API verisine bağlandı

// Kısa alias'lar oluştur
type SortablePageRequest = TransactionDTOs.SortablePageRequest
type ListItem = TransactionDTOs.ListItem

// API'den gelen veri yapısına göre tip tanımı (endpoints.json'dan)
type TransactionListItem = ListItem

const columnHelper = createColumnHelper<TransactionListItem>()

export const DebtsOverviewPage: React.FC = () => {
	const { t, i18n } = useTranslation()
	const [searchParams, setSearchParams] = useSearchParams()

	// URL'den filtreleri oku
	const loadFiltersFromURL = useCallback((): TransactionDTOs.TransactionFilterRequest => {
		const params = new URLSearchParams(searchParams)
		
		const result = {
			pageNumber: parseInt(params.get('page') || '0') || 0,
			pageSize: parseInt(params.get('size') || '10') || 10,
			columnName: params.get('sort') || 'id',
			asc: params.get('direction') === 'asc',
			name: params.get('name') || '',
			accountIds: params.get('accounts') ? params.get('accounts')!.split(',').map(Number).filter(n => !isNaN(n)) : undefined,
			contactIds: params.get('contacts') ? params.get('contacts')!.split(',').map(id => id === '0' ? 0 : Number(id)).filter(n => !isNaN(n)) : undefined,
			minAmount: params.get('minAmount') ? Number(params.get('minAmount')) || undefined : undefined,
			maxAmount: params.get('maxAmount') ? Number(params.get('maxAmount')) || undefined : undefined,
			minInstallmentCount: params.get('minInstallments') ? Number(params.get('minInstallments')) || undefined : undefined,
			maxInstallmentCount: params.get('maxInstallments') ? Number(params.get('maxInstallments')) || undefined : undefined,
			startDate: params.get('startDate') || '',
			endDate: params.get('endDate') || '',
			types: params.get('types') ? params.get('types')!.split(',') as TransactionType[] : undefined,
			statuses: params.get('statuses') ? params.get('statuses')!.split(',') as TransactionStatus[] : undefined
		}
		
		return result
	}, [searchParams])

	// Filtreleri URL'ye yaz
	const syncFiltersToURL = useCallback((filters: TransactionDTOs.TransactionFilterRequest) => {
		const params = new URLSearchParams()
		
		// Sadece boş olmayan değerleri URL'ye ekle
		if (filters.pageNumber && filters.pageNumber > 0) params.set('page', filters.pageNumber.toString())
		if (filters.pageSize && filters.pageSize !== 10) params.set('size', filters.pageSize.toString())
		if (filters.columnName && filters.columnName !== 'id') params.set('sort', filters.columnName)
		if (filters.asc !== undefined && filters.asc !== false) params.set('direction', 'asc')
		if (filters.name && filters.name.trim()) params.set('name', filters.name.trim())
		if (filters.accountIds && filters.accountIds.length > 0) params.set('accounts', filters.accountIds.join(','))
		if (filters.contactIds && filters.contactIds.length > 0) params.set('contacts', filters.contactIds.join(','))
		if (filters.minAmount && filters.minAmount > 0) params.set('minAmount', filters.minAmount.toString())
		if (filters.maxAmount && filters.maxAmount > 0) params.set('maxAmount', filters.maxAmount.toString())
		if (filters.minInstallmentCount && filters.minInstallmentCount > 0) params.set('minInstallments', filters.minInstallmentCount.toString())
		if (filters.maxInstallmentCount && filters.maxInstallmentCount > 0) params.set('maxInstallments', filters.maxInstallmentCount.toString())
		if (filters.startDate && filters.startDate.trim()) params.set('startDate', filters.startDate.trim())
		if (filters.endDate && filters.endDate.trim()) params.set('endDate', filters.endDate.trim())
		if (filters.types && filters.types.length > 0) params.set('types', filters.types.join(','))
		if (filters.statuses && filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','))
		
		setSearchParams(params, { replace: true })
	}, [setSearchParams])

	// Sayfalama parametreleri - URL'den yüklenecek
	const [pageParams, setPageParams] = useState<SortablePageRequest>(() => {
		const urlFilters = loadFiltersFromURL()
		return {
			pageNumber: urlFilters.pageNumber,
			pageSize: urlFilters.pageSize,
			columnName: urlFilters.columnName,
			asc: urlFilters.asc
		}
	})

	// Filter parametreleri - URL'den yüklenecek
	const [filterParams, setFilterParams] = useState<TransactionDTOs.TransactionFilterRequest>(() => {
		// İlk render'da URL'den filtreleri yükle
		return loadFiltersFromURL()
	})

	// Filter modal state'i
	const [filterModalOpen, setFilterModalOpen] = useState(false)
	
	// Uygulanan filtreler state'i (tablo üstünde gösterilecek) - URL'den yüklenecek
	const [appliedFilters, setAppliedFilters] = useState<TransactionDTOs.TransactionFilterRequest>(() => {
		return loadFiltersFromURL()
	})

	// URL değişikliklerini dinle (geri/ileri butonları için)
	useEffect(() => {
		const urlFilters = loadFiltersFromURL()
		setFilterParams(urlFilters)
		setAppliedFilters(urlFilters)
		setPageParams({
			pageNumber: urlFilters.pageNumber,
			pageSize: urlFilters.pageSize,
			columnName: urlFilters.columnName,
			asc: urlFilters.asc
		})
	}, [loadFiltersFromURL])


	// Infinity scroll için account state
	const [accountPage, setAccountPage] = useState(0)
	const [allAccounts, setAllAccounts] = useState<AccountDTOs.ListItem[]>([])
	const [hasMoreAccounts, setHasMoreAccounts] = useState(true)

	// Infinity scroll için contact state
	const [contactPage, setContactPage] = useState(0)
	const [allContacts, setAllContacts] = useState<ListMyContactsResponseDto[]>([])
	const [hasMoreContacts, setHasMoreContacts] = useState(true)

	const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useListMyActiveAccountsQuery({
		pageNumber: accountPage,
		pageSize: 10,
		columnName: 'id',
		asc: false
		}, {
		refetchOnMountOrArgChange: false,
		refetchOnFocus: false,
	})

	const { data: contactsData, isLoading: contactsLoading, refetch: refetchContacts } = useListMyActiveContactsQuery({
		pageNumber: contactPage,
		pageSize: 10,
		columnName: 'id',
		asc: false
	} as ContactSortablePageRequest, {
		refetchOnMountOrArgChange: false,
		refetchOnFocus: false,
	})

	const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useListMyTransactionsQuery(appliedFilters, {
		// Parametre değiştiğinde mutlaka yeniden istekte bulun
		refetchOnMountOrArgChange: true,
		refetchOnFocus: false,
	})



	// Listeleme hatasında toast göster
	useEffect(() => {
		if (transactionsError) {
			const errData = (transactionsError as any)?.data
			const message = errData?.message || t('messages.operationFailed')
			try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type: 'error' } })) } catch(_) {}
			// Validasyon detaylarını (ilk birkaçını) ayrıca göster
			const fieldErrors = errData?.data
			if (fieldErrors && typeof fieldErrors === 'object') {
				try {
					const firstFew = Object.entries(fieldErrors)
						.slice(0, 3)
						.map(([field, msgs]) => {
							const firstMsg = Array.isArray(msgs) ? String(msgs[0]) : String(msgs)
							return `${field}: ${firstMsg}`
						})
						.join(' | ')
					if (firstFew) {
						try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: firstFew, type: 'error' } })) } catch(_) {}
					}
				} catch (_) {
					// ignore formatting errors
				}
			}
		}
	}, [transactionsError, t])

	// Account verilerini birleştir
	useEffect(() => {
	if (accountsData?.data?.content) {
		setAllAccounts(prev => {
			const newAccounts = accountsData.data.content
			const existingIds = new Set(prev.map(acc => acc.id))
			const uniqueNewAccounts = newAccounts.filter(acc => !existingIds.has(acc.id))
			return [...prev, ...uniqueNewAccounts]
		})
		
		// Daha fazla sayfa var mı kontrol et
		setHasMoreAccounts(accountsData.data.content.length === 10 && !accountsData.data.last)
	}
	}, [accountsData])

	// Contact verilerini birleştir
	useEffect(() => {
	if (contactsData?.data?.content) {
		setAllContacts(prev => {
			const newContacts = contactsData.data.content
			const existingIds = new Set(prev.map(contact => contact.id))
			const uniqueNewContacts = newContacts.filter(contact => !existingIds.has(contact.id))
			return [...prev, ...uniqueNewContacts]
		})
		
		// Daha fazla sayfa var mı kontrol et
		setHasMoreContacts(contactsData.data.content.length === 10 && !contactsData.data.last)
	}
	}, [contactsData])

	// Daha fazla account yükle
	const loadMoreAccounts = useCallback(() => {
	if (hasMoreAccounts && !accountsLoading) {
		setAccountPage(prev => prev + 1)
		refetchAccounts()
	}
	}, [hasMoreAccounts, accountsLoading, refetchAccounts])

	// Daha fazla contact yükle
	const loadMoreContacts = useCallback(() => {
	if (hasMoreContacts && !contactsLoading) {
		setContactPage(prev => prev + 1)
		refetchContacts()
	}
	}, [hasMoreContacts, contactsLoading, refetchContacts])

	const accounts = useMemo(() => allAccounts, [allAccounts])
	const contacts = useMemo(() => allContacts, [allContacts])
	const [createTransaction, { isLoading: createLoading }] = useCreateTransactionMutation()
	const [deleteTransaction] = useDeleteTransactionMutation()
	
	// Modal açıldığında ilk input'a focus olmak için ref
	const accountSelectRef = useRef<HTMLDivElement>(null)

	const [modalOpen, setModalOpen] = useState(false)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false)
	const [selectedTransaction, setSelectedTransaction] = useState<TransactionListItem | null>(null)
	
	// Ödeme modalı için state'ler
	const [paymentModalOpen, setPaymentModalOpen] = useState(false)
	const [selectedInstallment, setSelectedInstallment] = useState<TransactionInstallmentRow | null>(null)
	const [paymentDate, setPaymentDate] = useState('')
	  const selectedTransactionId = selectedTransaction?.id ?? 0
  	const { data: installmentsData, isLoading: installmentsLoading, refetch: refetchInstallments } = useListTransactionInstallmentsQuery(selectedTransactionId, { 
    skip: !selectedTransactionId,
    refetchOnMountOrArgChange: true // Her transaction değiştiğinde yeniden fetch et
  })
  
  // Ödeme işlemi için mutation hook
  const [payInstallments] = usePayInstallmentsMutation()
  
  // Taksit verilerini manuel olarak yönet
  type TransactionInstallmentRow = {
    id: number
    amount: number
    debtDate: string
    installmentNumber: number
    descripton?: string
    paidDate?: string
    paid: boolean
  }
  const [currentInstallments, setCurrentInstallments] = useState<TransactionInstallmentRow[]>([])
  const [currentInstallmentsLoading, setCurrentInstallmentsLoading] = useState(false)
	const [form, setForm] = useState({
		accountId: undefined as number | undefined,
		contactId: undefined as number | undefined,
		type: TransactionType.DEBT as TransactionType,
		totalAmount: '0',
		totalInstallment: 1,
		name: '',
		description: '',
		debtDate: new Date().toISOString().split('T')[0], // Bugünün tarihi
		equalSharingBetweenInstallments: true,
		// Kategori form state'i: mevcut kategori id'leri ve yeni isimler
		categoryIds: [] as number[],
		newCategories: [] as string[],
	})

	// Kategori seçenekleri (mevcut backend endpoint'i gelene kadar local yönetim)
	const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string | number; label: string }>>([])
	const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({})
	const { data: categoriesData, isLoading: categoriesLoading } = useListMyActiveCategoriesQuery({ pageNumber: 0, pageSize: 50 })
	useEffect(() => {
		if (categoriesData?.data?.content) {
			setCategoryOptions(categoriesData.data.content.map(c => ({ value: c.id, label: c.name })))
		}
	}, [categoriesData])

	// Hesap türü kredi kartı ise işlem türlerini (DEBT, PAYMENT) ile sınırla
	const selectedAccount = useMemo(() => {
		return accounts.find((a) => a.id === form.accountId)
	}, [accounts, form.accountId])

	const isCreditCardAccount = selectedAccount?.type === AccountType.CREDIT_CARD

	const typeOptions = useMemo(() => {
		const all = TransactionHelpers.getTypeOptions(t)
		return isCreditCardAccount
			? all.filter((opt) => opt.value === TransactionType.DEBT || opt.value === TransactionType.PAYMENT || opt.value === TransactionType.CREDIT)
			: all
	}, [isCreditCardAccount, t])

	const handleAccountChange = useCallback((value: unknown) => {
		const newAccountId = value as number
		const acc = accounts.find((a) => a.id === newAccountId)
		setForm((prev) => {
			let nextType = prev.type
			if (acc?.type === AccountType.CREDIT_CARD) {
				if (nextType !== TransactionType.DEBT && nextType !== TransactionType.PAYMENT && nextType !== TransactionType.CREDIT) {
					nextType = TransactionType.DEBT
				}
			}
			return { ...prev, accountId: newAccountId, type: nextType }
		})
	}, [accounts])

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

	// Bugünün tarihini formatla (YYYY-MM-DD)
	const today = (() => {
		const now = new Date()
		return now.getFullYear() + '-' + 
			String(now.getMonth() + 1).padStart(2, '0') + '-' + 
			String(now.getDate()).padStart(2, '0')
	})()

	  // Modal açıldığında ilk input'a focus ol
  useEffect(() => {
    if (modalOpen && accountSelectRef.current) {
      setTimeout(() => {
        accountSelectRef.current?.focus()
      }, 100)
    }
  }, [modalOpen])
  
  // Taksit verilerini güncelle
  useEffect(() => {
    if (installmentsData?.data && selectedTransaction?.id === selectedTransactionId) {
      setCurrentInstallments(installmentsData.data)
      setCurrentInstallmentsLoading(false)
    }
  }, [installmentsData, selectedTransaction?.id, selectedTransactionId])

  // Aynı işlem detayı tekrar açıldığında da yeniden fetch et
  useEffect(() => {
    if (detailModalOpen && selectedTransactionId) {
      try {
        setCurrentInstallmentsLoading(true)
        refetchInstallments()
      } catch (_) {}
    }
  }, [detailModalOpen, selectedTransactionId, refetchInstallments])

	  // İşlem detayını göster
  const showTransactionDetail = (transaction: TransactionListItem) => {
    setSelectedTransaction(transaction)
    setDetailModalOpen(true)
    // Taksit verilerini temizle
    setCurrentInstallments([])
    setCurrentInstallmentsLoading(true)
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
			// showToast(t('debt.deleteSuccess'), 'success') // Removed useToast
			setDeleteModalOpen(false)
			setSelectedTransaction(null)
		} catch (error) {
			// showToast(t('messages.operationFailed'), 'error') // Removed useToast
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

	// Ödeme modalını aç
	const openPaymentModal = (installment: TransactionInstallmentRow) => {
		setSelectedInstallment(installment)
		setPaymentDate(today)
		setPaymentModalOpen(true)
	}

	// Ödeme modalını kapat
	const closePaymentModal = () => {
		setPaymentModalOpen(false)
		setSelectedInstallment(null)
		setPaymentDate('')
	}

	// Ödeme işlemi
	const handlePayment = async () => {
		if (!selectedInstallment || !paymentDate) return

		try {
			await payInstallments({
				data: { 
					ids: [selectedInstallment.id], 
					paidDate: paymentDate 
				}
			}).unwrap()
			
			// showToast(t('installment.paymentSuccess'), 'success') // Removed useToast
			closePaymentModal()
			
			// Taksit listesini yenile
			if (selectedTransaction) {
				refetchInstallments()
			}
		} catch (error) {
			// showToast(t('messages.operationFailed'), 'error') // Removed useToast
		}
	}

	// API'den gelen işlemleri sadece borçlar olarak filtrele
	const debts: TransactionListItem[] = useMemo(() => {
		if (!transactionsData?.data?.content) return []

		// Yeni API response yapısına göre veriyi al
		return transactionsData.data.content
	}, [transactionsData])

	// Sayfalama işlemleri
	const handlePageChange = (newPage: number) => {
		const newParams = { ...pageParams, pageNumber: newPage }
		setPageParams(newParams)
		const combined = { ...appliedFilters, ...newParams }
		setAppliedFilters(combined)
		// URL'yi güncelle
		syncFiltersToURL(combined)
	}

	const handlePageSizeChange = (newPageSize: number) => {
		const newParams = { ...pageParams, pageSize: newPageSize, pageNumber: 0 }
		setPageParams(newParams)
		const combined = { ...appliedFilters, ...newParams }
		setAppliedFilters(combined)
		// URL'yi güncelle
		syncFiltersToURL(combined)
	}

	// Filter işlemleri
	const handleFilterChange = (key: keyof TransactionDTOs.TransactionFilterRequest, value: any) => {
		// contactIds için özel kontrol - null değerleri destekler
		if (key === 'contactIds') {
			setFilterParams(prev => ({ ...prev, [key]: value }))
			return
		}
		
		// 0 değerlerini undefined olarak set et
		if (value === 0 || value === '0') {
			setFilterParams(prev => ({ ...prev, [key]: undefined }))
		} else if (value === null) {
			// null değerleri koru (kişi seçilmemiş durumu için)
			setFilterParams(prev => ({ ...prev, [key]: null }))
		} else {
			setFilterParams(prev => ({ ...prev, [key]: value }))
		}
	}

	const applyFilters = () => {
		// Filter parametrelerini sayfalama parametreleriyle birleştir
		const combinedParams: any = {
			...filterParams,
			pageNumber: 0, // Filter uygulandığında ilk sayfaya dön
			pageSize: pageParams.pageSize,
			columnName: pageParams.columnName,
			asc: pageParams.asc
		}

		// Tutar alanlarını backend uyumlu sayıya çevir (virgül/nokta normalize)
		if (combinedParams.minAmount !== undefined) {
			const v = parseCurrencyToNumber(combinedParams.minAmount)
			combinedParams.minAmount = v === undefined || v === 0 ? undefined : v
		}
		if (combinedParams.maxAmount !== undefined) {
			const v = parseCurrencyToNumber(combinedParams.maxAmount)
			combinedParams.maxAmount = v === undefined || v === 0 ? undefined : v
		}
		
		// Boş değerleri temizle
		Object.keys(combinedParams).forEach(key => {
			const k = key as keyof TransactionDTOs.TransactionFilterRequest
			if (combinedParams[k] === '' || combinedParams[k] === undefined) {
				delete combinedParams[k]
			}
			// null değerleri koru (kişi seçilmemiş durumu için)
			if (combinedParams[k] === null) {
				// null değerleri silme, backend'e gönder
			}
			// minInstallmentCount ve maxInstallmentCount için özel kontrol
			if (k === 'minInstallmentCount' && combinedParams[k] === 0) {
				delete combinedParams[k]
			}
			if (k === 'maxInstallmentCount' && combinedParams[k] === 0) {
				delete combinedParams[k]
			}
			// minAmount ve maxAmount için 0 değerlerini gönderme
			if (k === 'minAmount' && combinedParams[k] === 0) delete combinedParams[k]
			if (k === 'maxAmount' && combinedParams[k] === 0) delete combinedParams[k]
		})

		// Uygulanan filtre özetini güncelle (sadece temizlenmiş parametrelerle)
		setAppliedFilters(combinedParams)
		
		setPageParams(combinedParams)
		setFilterModalOpen(false)
		
		// URL'yi güncelle
		syncFiltersToURL(combinedParams)
	}

	const clearFilters = () => {
		const defaultFilters = {
			pageNumber: 0,
			pageSize: 10,
			columnName: 'id',
			asc: false,
			name: '',
			accountIds: undefined,
			contactIds: undefined,
			minAmount: undefined,
			maxAmount: undefined,
			minInstallmentCount: undefined,
			maxInstallmentCount: undefined,
			startDate: '',
			endDate: '',
			types: undefined,
			statuses: undefined
		}
		
		setFilterParams(defaultFilters)
		setAppliedFilters(defaultFilters)
		
		// Sayfalama parametrelerini de sıfırla
		setPageParams({
			pageNumber: 0,
			pageSize: 10,
			columnName: 'id',
			asc: false
		})
		
		// URL'yi temizle
		syncFiltersToURL(defaultFilters)
	}

	const hasActiveFilters = () => {
		// Sadece gerçekten aktif olan filtreleri say
		const hasName = filterParams.name && filterParams.name.trim() !== ''
		const hasAccountIds = filterParams.accountIds && filterParams.accountIds.length > 0
		const hasContactIds = filterParams.contactIds && filterParams.contactIds.length > 0
		const hasMinAmount = !!parseCurrencyToNumber(filterParams.minAmount as any)
		const hasMaxAmount = !!parseCurrencyToNumber(filterParams.maxAmount as any)
		const hasMinInstallmentCount = filterParams.minInstallmentCount && filterParams.minInstallmentCount > 0
		const hasMaxInstallmentCount = filterParams.maxInstallmentCount && filterParams.maxInstallmentCount > 0
		const hasStartDate = filterParams.startDate && filterParams.startDate.trim() !== ''
		const hasEndDate = filterParams.endDate && filterParams.endDate.trim() !== ''
		const hasTypes = filterParams.types && filterParams.types.length > 0
		const hasStatuses = filterParams.statuses && filterParams.statuses.length > 0

		return hasName || hasAccountIds || hasContactIds || hasMinAmount || hasMaxAmount || 
			   hasMinInstallmentCount || hasMaxInstallmentCount || hasStartDate || hasEndDate || hasTypes || hasStatuses
	}

	// Uygulanan filtrelerde aktif olan var mı?
	const hasAppliedActiveFilters = () => {
		const hasName = appliedFilters.name && appliedFilters.name.trim() !== ''
		const hasAccountIds = appliedFilters.accountIds && appliedFilters.accountIds.length > 0
		const hasContactIds = appliedFilters.contactIds && appliedFilters.contactIds.length > 0
		const hasMinAmount = typeof appliedFilters.minAmount === 'number' && appliedFilters.minAmount > 0
		const hasMaxAmount = typeof appliedFilters.maxAmount === 'number' && appliedFilters.maxAmount > 0
		const hasMinInstallmentCount = appliedFilters.minInstallmentCount && appliedFilters.minInstallmentCount > 0
		const hasMaxInstallmentCount = appliedFilters.maxInstallmentCount && appliedFilters.maxInstallmentCount > 0
		const hasStartDate = appliedFilters.startDate && appliedFilters.startDate.trim() !== ''
		const hasEndDate = appliedFilters.endDate && appliedFilters.endDate.trim() !== ''
		const hasTypes = appliedFilters.types && appliedFilters.types.length > 0
		const hasStatuses = appliedFilters.statuses && appliedFilters.statuses.length > 0

		return hasName || hasAccountIds || hasContactIds || hasMinAmount || hasMaxAmount || 
			   hasMinInstallmentCount || hasMaxInstallmentCount || hasStartDate || hasEndDate || hasTypes || hasStatuses
	}

	// Üst bardan chip kaldırma: hem appliedFilters hem filterParams temizlenir ve istek tekrar atılır
	const removeAppliedFilter = (key: keyof TransactionDTOs.TransactionFilterRequest) => {
		const nextApplied: TransactionDTOs.TransactionFilterRequest = { ...appliedFilters }
		const nextFilter: TransactionDTOs.TransactionFilterRequest = { ...filterParams }

		if (key === 'name' || key === 'startDate' || key === 'endDate') {
			nextApplied[key] = '' as any
			nextFilter[key] = '' as any
		} else {
			nextApplied[key] = undefined as any
			nextFilter[key] = undefined as any
		}

		setAppliedFilters(nextApplied)
		setFilterParams(nextFilter)

		// Sayfayı başa al ve yeni parametrelerle isteği tetikle
		const refreshedParams = {
			...pageParams,
			pageNumber: 0,
			[key]: nextApplied[key]
		} as any
		// Boş değerleri tamamen kaldır
		if (refreshedParams[key] === '' || refreshedParams[key] === undefined) {
			delete refreshedParams[key]
		}
		setPageParams(refreshedParams)
		
		// URL'yi güncelle
		syncFiltersToURL({ ...nextApplied, ...refreshedParams })
	}

	// Çoklu seçimli filtrelerden tek bir öğeyi kaldır (hesap, kişi, tür)
	const removeAppliedFilterItem = (key: string, value: any) => {
		// Güvenlik: yalnızca beklenen anahtarlar için işle
		if (key !== 'accountIds' && key !== 'contactIds' && key !== 'types' && key !== 'statuses') return
		const nextApplied: TransactionDTOs.TransactionFilterRequest = { ...appliedFilters }
		const nextFilter: TransactionDTOs.TransactionFilterRequest = { ...filterParams }

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
			...pageParams,
			pageNumber: 0
		}
		if (filtered.length > 0) {
			refreshedParams[key] = filtered
		} else {
			delete refreshedParams[key]
		}
		setPageParams(refreshedParams)
		
		// URL'yi güncelle
		syncFiltersToURL({ ...nextApplied, ...refreshedParams })
	}


	// Sütun sıralama - 3 aşamalı: ASC -> DESC -> Default (id, DESC)
	const handleSortClick = (columnName: string) => {
		setPageParams(prev => {
			let newParams: SortablePageRequest
			// Eğer aynı sütuna tıklanıyorsa
			if (prev.columnName === columnName) {
				if (prev.asc === true) {
					// ASC -> DESC
					newParams = { ...prev, asc: false }
				} else if (prev.asc === false) {
					// DESC -> Default (id, DESC)
					newParams = { ...prev, columnName: 'id', asc: false, pageNumber: 0 }
				} else {
					// Bu duruma düşmemesi gerekir ama güvenlik için
					newParams = { ...prev, columnName, asc: true, pageNumber: 0 }
				}
			} else {
				// Farklı sütuna tıklanıyorsa -> ASC
				newParams = { ...prev, columnName, asc: true, pageNumber: 0 }
			}
			const combined = { ...appliedFilters, ...newParams }
			setAppliedFilters(combined)
			// URL'yi güncelle
			syncFiltersToURL(combined)
			return newParams
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
		// Status sütununu başa al - sadece tek bir status sütunu olmalı
		columnHelper.accessor('status', {
			header: () => (
				<button
					onClick={() => handleSortClick('status')}
					className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
				>
					{t('table.columns.status')}
					{getSortIndicator('status')}
				</button>
			),
			cell: (info) => <StatusBadge status={info.getValue() as TransactionStatus} />,
			meta: {
				className: 'min-w-[100px]'
			}
		}),
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
		cell: (info) => info.getValue() || '',
		meta: {
			className: 'min-w-[160px]'
		}
	}),
	columnHelper.accessor('contactName', {
		header: () => (
			<button
				onClick={() => handleSortClick('contactName')}
				className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
			>
				{t('table.columns.contact')}
				{getSortIndicator('contactName')}
			</button>
		),
		cell: (info) => info.getValue() || '-',
		meta: {
			className: 'min-w-[150px]'
		}
	}),
	columnHelper.accessor('accountName', {
		header: () => (
			<button
				onClick={() => handleSortClick('accountName')}
				className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
			>
				{t('table.columns.account')}
				{getSortIndicator('accountName')}
			</button>
		),
		cell: (info) => info.getValue(),
		meta: {
			className: 'min-w-[120px]'
		}
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
		cell: (info) => getTransactionTypeText(info.getValue()),
		meta: {
			className: 'min-w-[100px]'
		}
	}),
	columnHelper.accessor('totalInstallment', {
		header: () => (
			<button
				onClick={() => handleSortClick('totalInstallment')}
				className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
			>
				{t('table.columns.totalInstallment')}
				{getSortIndicator('totalInstallment')}
			</button>
		),
		cell: (info) => {
			const totalInstallment = info.getValue() || 0
			return (
				<span className="font-medium text-slate-700 dark:text-slate-300">
					{totalInstallment}
				</span>
			)
		},
		meta: {
			className: 'min-w-[100px] text-center'
		}
	}),
	columnHelper.accessor('totalAmount', {
		header: () => (
			<button
				onClick={() => handleSortClick('totalAmount')}
				className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
			>
				{t('table.columns.totalAmount')}
				{getSortIndicator('totalAmount')}
			</button>
		),
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
		header: () => (
			<button
				onClick={() => handleSortClick('paidAmount')}
				className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
			>
				{t('table.columns.paidAmount')}
				{getSortIndicator('paidAmount')}
			</button>
		),
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
			className: 'min-w-[150px]'
		}
	})
	]

	const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault()
	const newErrors: { [k: string]: string | undefined } = {}
	if (!form.accountId) newErrors.accountId = t('validation.required')
	if (!form.name || !form.name.trim()) newErrors.name = t('validation.required')
	if (!form.totalAmount || form.totalAmount === '0') newErrors.totalAmount = t('validation.required')
	if (!form.debtDate) newErrors.debtDate = t('validation.required')
	if (form.totalInstallment !== undefined && Number(form.totalInstallment) < 1) newErrors.totalInstallment = t('validation.required')
	setErrors(newErrors)
	if (Object.keys(newErrors).length > 0) return

	// Para formatından sayıya çevir
	const totalAmountNumber = parseFloat(form.totalAmount.replace(/\./g, '').replace(',', '.')) || 0

	try {
		const result = await createTransaction({
			accountId: form.accountId as number,
			contactId: form.contactId || undefined,
			name: form.name || undefined,
			description: form.description || undefined,
			totalAmount: totalAmountNumber,
			type: form.type,
			totalInstallment: form.totalInstallment || undefined,
			debtDate: form.debtDate,
			equalSharingBetweenInstallments: form.equalSharingBetweenInstallments,
			category: {
				categoryIds: form.categoryIds,
				newCategories: form.newCategories,
			},
		}).unwrap()
		
		// Sadece başarılı sonuçta modal'ı kapat
		if (result && result.type === true) {
			setErrors({})
			setForm({ accountId: undefined, contactId: undefined, type: TransactionType.DEBT, totalAmount: '0', totalInstallment: 1, name: '', description: '', debtDate: new Date().toISOString().split('T')[0], equalSharingBetweenInstallments: true, categoryIds: [], newCategories: [] })
			setModalOpen(false)
			// showToast(t('messages.transactionCreated'), 'success') // Removed useToast
		}
	} catch (error) {
		// Hata durumunda modal açık kalır, kullanıcı düzeltebilir
		console.error('Transaction creation failed:', error)
		const errData = (error as any)?.data
		const errorMessage = errData?.message || t('messages.operationFailed')
		// Backend alan hatalarını forma yansıt
		const fieldErrors = errData?.data
		if (fieldErrors && typeof fieldErrors === 'object') {
			const mapped: { [k: string]: string } = {}
			Object.entries(fieldErrors).forEach(([key, messages]) => {
				const firstMessage = Array.isArray(messages) ? String(messages[0]) : String(messages)
				// Backend alan adlarını frontend form alanlarına eşle
				let formKey = key
				if (key === 'totalInstallment') formKey = 'totalInstallment'
				if (key === 'debtDate') formKey = 'debtDate'
				if (key === 'accountId') formKey = 'accountId'
				if (key === 'name') formKey = 'name'
				if (key === 'totalAmount') formKey = 'totalAmount'
				if (key === 'type') formKey = 'type'
				mapped[formKey] = firstMessage
			})
			setErrors(mapped)
		}
		// showToast(errorMessage, 'error') // Removed useToast
	}
	}

	const accountIdToName = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a.name])), [accounts])
	const contactIdToName = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c.fullName])), [contacts])

	const handleRemoveKey = (key: any) => removeAppliedFilter(key as keyof TransactionDTOs.TransactionFilterRequest)

	const isLoading = accountsLoading || contactsLoading || transactionsLoading

	return (
	<div className="h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0 flex flex-col min-h-0 box-border">
		<div className="w-full flex-1 flex flex-col min-h-0">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.debts')}</h2>
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
									if (filterParams.name && filterParams.name.trim() !== '') count++
									if (filterParams.accountIds && filterParams.accountIds.length > 0) count++
									if (filterParams.contactIds && filterParams.contactIds.length > 0) count++
									if (filterParams.minAmount && filterParams.minAmount > 0) count++
									if (filterParams.maxAmount && filterParams.maxAmount > 0) count++
									if (filterParams.minInstallmentCount && filterParams.minInstallmentCount > 0) count++
									if (filterParams.maxInstallmentCount && filterParams.maxInstallmentCount > 0) count++
									if (filterParams.startDate && filterParams.startDate.trim() !== '') count++
									if (filterParams.endDate && filterParams.endDate.trim() !== '') count++
									if (filterParams.types && filterParams.types.length > 0) count++
									if (filterParams.statuses && filterParams.statuses.length > 0) count++
									return count
								})()}
							</span>
						)}
					</Button>
					<Button 
						onClick={() => { 
							setForm({ accountId: undefined, contactId: undefined, type: TransactionType.DEBT, totalAmount: '0', totalInstallment: 1, name: '', description: '', debtDate: new Date().toISOString().split('T')[0], equalSharingBetweenInstallments: true, categoryIds: [], newCategories: [] })
							setModalOpen(true) 
						}} 
						variant="primary"
					>
						{t('buttons.newDebt')}
					</Button>
				</div>
			</div>

			{/* Uygulanan Akıllı Filtre Özeti - Tablo üstünde göster */}
			{hasAppliedActiveFilters() && (
				<FilterChips
					appliedFilters={appliedFilters}
					onRemoveKey={handleRemoveKey}
					onRemoveItem={removeAppliedFilterItem}
					accountIdToName={accountIdToName}
					contactIdToName={contactIdToName}
					getTypeLabel={(v) => getTransactionTypeText(String(v))}
				/>
			)}

				<div className="flex-1 flex flex-col min-h-0">
					{isLoading ? (
						<TableSkeleton columns={8} rows={5} />
					) : (
						<Table 
							data={debts} 
							columns={columns} 
							title={t('table.titles.debtList')}
							showPagination={true}
							pageSize={pageParams.pageSize}
							currentPage={pageParams.pageNumber}
							totalPages={transactionsData?.data?.totalPages || 0}
							totalRecords={transactionsData?.data?.totalElements || 0}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							isFirstPage={transactionsData?.data?.first}
							isLastPage={transactionsData?.data?.last}
							className="h-full"
						/>
					)}
				</div>

			{/* Borç Girişi Modal */}
			<Modal 
				open={modalOpen} 
				onClose={() => setModalOpen(false)} 
				title={t('modals.newDebt')}
				size="lg"
				zIndex={10003}
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
								onLoadMore={loadMoreContacts}
								hasMore={hasMoreContacts}
								isLoadingMore={contactsLoading}
							/>
							<Select 
								id="accountId"
								label="Hesap *"
								value={form.accountId ?? ''}
								onChange={handleAccountChange}
								options={accounts.map((a) => ({ value: a.id, label: a.name }))}
								placeholder="Hesap seçiniz"
								required
								error={errors.accountId}
								ref={accountSelectRef}
								onLoadMore={loadMoreAccounts}
								hasMore={hasMoreAccounts}
								isLoadingMore={accountsLoading}
							/>
							

							
							<Input 
								id="name"
								label="İşlem Adı *"
								value={form.name}
								onChange={(value) => setForm((p) => ({ ...p, name: value as string }))}
								placeholder="Örn: Elektrik Faturası"
								required
								error={errors.name}
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
									error={errors.totalAmount}
								/>
								<Input 
									id="totalInstallment"
									label="Taksit Sayısı"
									value={form.totalInstallment}
									onChange={(value) => setForm((p) => ({ ...p, totalInstallment: value as number }))}
									placeholder="1"
									type="number"
									min={1}
									step={1}
									error={errors.totalInstallment}
								/>
							</div>

							{/* Eşit bölüşüm seçeneği ve bilgi butonu */}
							<div className="flex items-start gap-3">
								<label className="inline-flex items-center gap-2 select-none cursor-pointer">
									<input
										id="equalSharingBetweenInstallments"
										type="checkbox"
										checked={!!form.equalSharingBetweenInstallments}
										onChange={(e) => setForm((p) => ({ ...p, equalSharingBetweenInstallments: e.target.checked }))}
										className="h-4 w-4 rounded border-slate-300 text-mm-primary focus:ring-mm-primary"
									/>
									<span className="text-base font-medium text-slate-900 dark:text-mm-text">
										{t('transaction.equalSharingBetweenInstallments.label')}
									</span>
								</label>
								<div className="relative">
									<button
										type="button"
										aria-label="Info"
										className="h-5 w-5 rounded-full border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center text-xs"
										onClick={(e) => {
											const target = e.currentTarget.nextElementSibling as HTMLDivElement | null
											if (target) {
												target.classList.toggle('hidden')
											}
										}}
									>
										?
									</button>
									<div className="hidden absolute z-50 mt-2 w-80 p-3 rounded-lg border border-slate-200 dark:border-mm-border bg-white dark:bg-mm-card shadow-xl text-sm text-slate-700 dark:text-mm-text">
										<div className="font-medium mb-1">{t('transaction.equalSharingBetweenInstallments.title')}</div>
										<p className="leading-relaxed">{t('transaction.equalSharingBetweenInstallments.help')}</p>
									</div>
								</div>
							</div>
							
							<Select 
								id="type"
								label={"İşlem Türü"}
								value={form.type}
								onChange={(value) => setForm((p) => ({ ...p, type: value as TransactionType }))}
								options={typeOptions}
								placeholder={"İşlem türü seçiniz"}
								required
								error={errors.type}
							/>
							
							{/* Kategoriler: Çoklu seçim + Enter ile yeni kategori oluşturma */}
							<Select
								id="categories"
								label={t('transaction.categories')}
								value={[...form.categoryIds, ...form.newCategories]}
								onChange={(value) => {
									const arr = Array.isArray(value) ? value : [value]
									const ids = arr.filter(v => typeof v === 'number') as number[]
									const news = arr.filter(v => typeof v === 'string') as string[]
									setForm((p) => ({ ...p, categoryIds: ids, newCategories: news }))
								}}
								options={categoryOptions}
								placeholder={t('transaction.categoryPlaceholder')}
								isMulti
								closeMenuOnSelect={false}
								creatable
								onCreateOption={(label) => {
									setForm((p) => ({ ...p, newCategories: Array.from(new Set([...(p.newCategories || []), label])) }))
									setCategoryOptions((opts) => {
										if (opts.some(o => o.label.toLowerCase() === label.toLowerCase())) return opts
										return [...opts, { value: label, label }]
									})
								}}
								createOptionText={(lbl) => `${t('common.create')}: \"${lbl}\"`}
							/>
							
							<DatePicker
								id="debtDate"
								label={t('transaction.debtDate')}
								value={form.debtDate}
								onChange={(value) => setForm((p) => ({ ...p, debtDate: value as string }))}
								required
								error={errors.debtDate}
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
				size="xl"
				zIndex={10000}
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

						{/* Taksitler */}
						{currentInstallmentsLoading ? (
							<div className="mt-4 pt-3 border-t border-slate-200 dark:border-mm-border">
								<div className="flex items-center justify-center py-8">
									<div className="text-slate-500 dark:text-mm-subtleText">Taksitler yükleniyor...</div>
								</div>
							</div>
						) : currentInstallments && Array.isArray(currentInstallments) && currentInstallments.length > 0 ? (
							<div className="mt-4 pt-3 border-t border-slate-200 dark:border-mm-border">
								<div className="flex items-center justify-between mb-3">
									<h4 className="text-base font-medium text-slate-900 dark:text-mm-text flex items-center gap-2">
										<FontAwesomeIcon icon={faCalendarAlt} className="text-lg text-slate-600 dark:text-mm-subtleText" />
										{t('transaction.installmentsDetail')}
									</h4>
									<div className="text-xs text-slate-500 dark:text-mm-subtleText bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
										{currentInstallments.length} {t('installment.installment')}
									</div>
								</div>
								
								<div className="border border-slate-200 dark:border-mm-border rounded-lg overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-slate-50 dark:bg-slate-800">
											<tr>
												<th className="text-left px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
													<div className="flex items-center gap-2">
														<FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-slate-500" />
														{t('table.columns.installmentNumber')}
													</div>
												</th>
												<th className="text-left px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
													{t('table.columns.debtDate')}
												</th>
												<th className="text-right px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
													{t('table.columns.amount')}
												</th>
												<th className="text-center px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
													{t('table.columns.status')}
												</th>
												{currentInstallments.some(ins => ins.paid && ins.paidDate) && (
													<th className="text-left px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
														{t('table.columns.paidDate')}
													</th>
												)}
												<th className="text-center px-3 py-2 font-medium text-slate-700 dark:text-mm-text">
													{t('table.columns.actions')}
												</th>
											</tr>
										</thead>
										<tbody>
											{currentInstallments.map((ins) => (
												<tr 
													key={ins.id} 
													className={`border-t border-slate-100 dark:border-mm-border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
														ins.paid ? 'bg-green-50/30 dark:bg-green-900/10' : ''
													}`}
												>
													<td className="px-3 py-2">
														<div className="flex items-center gap-2">
															<span className={`font-medium text-slate-900 dark:text-mm-text ${ins.paid ? '!text-green-700 !dark:text-green-400' : ''}`}>
																{ins.installmentNumber}. {t('installment.installment')}
															</span>
														</div>
													</td>
													<td className="px-3 py-2 text-slate-700 dark:text-mm-subtleText">
														{new Date(ins.debtDate).toLocaleDateString(
															i18n.language === 'tr' ? 'tr-TR' : 'en-US',
															{ 
																year: 'numeric', 
																month: 'short', 
																day: 'numeric' 
															}
														)}
													</td>
													<td className="px-3 py-2 text-right">
														<span className={`font-semibold ${
															ins.paid ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-mm-text'
														}`}>
															₺{Number(ins.amount || 0).toLocaleString('tr-TR')}
														</span>
													</td>
														<td className="px-3 py-2 text-center">
															<div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
															ins.paid 
																? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
																: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
														}`}>
																<span className={`w-1.5 h-1.5 rounded-full ${
																	ins.paid ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-500'
																}`}></span>
																{ins.paid ? t('status.paid') : t('status.pending')}
															</div>
														</td>
													{currentInstallments.some(ins => ins.paid && ins.paidDate) && (
														<td className="px-3 py-2 text-slate-600 dark:text-mm-subtleText">
															{ins.paid && ins.paidDate ? (
																<div className="flex items-center gap-1 text-green-600 dark:text-green-500">
																	<FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
																	{new Date(ins.paidDate).toLocaleDateString(
																		i18n.language === 'tr' ? 'tr-TR' : 'en-US',
																		{ 
															year: 'numeric', 
															month: 'short', 
															day: 'numeric' 
														}
													)}
												</div>
											) : (
												<span className="text-slate-400 dark:text-slate-500">-</span>
											)}
										</td>
									)}
									<td className="px-3 py- text-center">
										{!ins.paid && (
											<Button
												onClick={() => openPaymentModal(ins)}
												variant="secondary"
												className="!px-0.5 !py-0 !text-xs !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 hover:!border-green-700 focus:!ring-green-600/50 !min-w-[40px] text-center !h-6"
											>
												{getActionLabelForType(selectedTransaction?.type as string)}
											</Button>
										)}
									</td>
								</tr>
											))}
										</tbody>
									</table>
								</div>
								
								{/* Özet Bilgi */}
								<div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
									<div className="grid grid-cols-2 gap-3 text-xs">
										<div className="text-center">
											<div className="text-slate-600 dark:text-mm-subtleText">{t('installment.totalPaid')}</div>
											<div className="text-green-600 dark:text-green-400 font-medium">
												₺{currentInstallments
													.filter(ins => ins.paid)
													.reduce((sum, ins) => sum + Number(ins.amount || 0), 0)
													.toLocaleString('tr-TR')}
											</div>
										</div>
										<div className="text-center">
											<div className="text-slate-600 dark:text-mm-subtleText">{t('installment.totalPending')}</div>
											<div className="text-orange-600 dark:text-orange-400 font-medium">
												₺{currentInstallments
													.filter(ins => !ins.paid)
													.reduce((sum, ins) => sum + Number(ins.amount || 0), 0)
													.toLocaleString('tr-TR')}
											</div>
										</div>
									</div>
								</div>
							</div>
						) : !currentInstallmentsLoading && (
							<div className="mt-4 pt-3 border-t border-slate-200 dark:border-mm-border">
								<div className="flex items-center justify-center py-8">
									<div className="text-slate-500 dark:text-mm-subtleText">Bu işlem için taksit bulunamadı.</div>
								</div>
							</div>
						)}
					</div>
				)}
			</Modal>

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
									if (filterParams.name && filterParams.name.trim() !== '') count++
									if (filterParams.accountIds && filterParams.accountIds.length > 0) count++
									if (filterParams.contactIds && filterParams.contactIds.length > 0) count++
									if (filterParams.minAmount && filterParams.minAmount > 0) count++
									if (filterParams.maxAmount && filterParams.maxAmount > 0) count++
									if (filterParams.minInstallmentCount && filterParams.minInstallmentCount > 0) count++
									if (filterParams.maxInstallmentCount && filterParams.maxInstallmentCount > 0) count++
									if (filterParams.startDate && filterParams.startDate.trim() !== '') count++
									if (filterParams.endDate && filterParams.endDate.trim() !== '') count++
									if (filterParams.types && filterParams.types.length > 0) count++
									if (filterParams.statuses && filterParams.statuses.length > 0) count++
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
								id="filterName"
								label={t('filters.name')}
								value={filterParams.name || ''}
								onChange={(value) => handleFilterChange('name', value)}
								placeholder={t('placeholders.searchByName')}
								className="md:col-span-2"
							/>
							
							<Select
								id="filterAccount"
								label={t('table.columns.account')}
								value={filterParams.accountIds || []}
								onChange={(value) => handleFilterChange('accountIds', Array.isArray(value) ? value : [value])}
								options={accounts.map((acc) => ({ value: acc.id, label: acc.name }))}
								placeholder={t('placeholders.selectAccount')}
								isMulti
								closeMenuOnSelect={false}
							/>
							
							<Select
								id="filterContact"
								label={t('table.columns.contact')}
								value={filterParams.contactIds || []}
								onChange={(value) => {
									// Sadece "No Contact" seçildiğinde [null] şeklinde gel
									if (Array.isArray(value)) {
										// Eğer array içinde sadece null varsa, [null] olarak set et
										if (value.length === 1 && value[0] === 0) {
											handleFilterChange('contactIds', [0])
										} else {
											// Normal array değerlerini set et
											handleFilterChange('contactIds', value)
										}
									} else if (value === 0) {
										// Sadece "No Contact" seçildiğinde
										handleFilterChange('contactIds', [0])
									} else {
										// Normal kişi ID'si seçildiğinde
										handleFilterChange('contactIds', [value])
									}
								}}
								options={[
									{ value: 0, label: t('filters.noContact') },
									...contacts.map((c) => ({ value: c.id, label: c.fullName }))
								]}
								placeholder={t('placeholders.selectContact')}
								isMulti
								closeMenuOnSelect={false}
							/>
							
							<Select
								id="filterType"
								label={t('table.columns.type')}
								value={filterParams.types || []}
								onChange={(value) => handleFilterChange('types', Array.isArray(value) ? value : [value])}
								options={TransactionHelpers.getTypeOptions(t)}
								placeholder={t('placeholders.selectType')}
								isMulti
								closeMenuOnSelect={false}
								className="md:col-span-2"
							/>

							{/* Statuses filter */}
							<Select
								id="filterStatus"
								label={t('table.columns.status')}
								value={filterParams.statuses || []}
								onChange={(value) => handleFilterChange('statuses', Array.isArray(value) ? value : [value])}
								options={[
									{ value: TransactionStatus.PENDING, label: t('status.pending') },
									{ value: TransactionStatus.PARTIAL, label: t('status.partial') },
									{ value: TransactionStatus.PAID, label: t('status.paid') },
								]}
								placeholder={t('placeholders.selectStatus')}
								isMulti
								closeMenuOnSelect={false}
								className="md:col-span-2"
							/>
						</div>
					</div>

					{/* Amount Filters Section */}
					<div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-2 h-2 bg-green-500 rounded-full"></div>
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">
								{t('filters.amountFilters')}
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								id="filterMinAmount"
								label={t('filters.minAmount')}
								value={filterParams.minAmount || ''}
								onChange={(value) => handleFilterChange('minAmount', value)}
								placeholder="0,00"
								formatCurrency
								currencySymbol="₺"
							/>
							
							<Input
								id="filterMaxAmount"
								label={t('filters.maxAmount')}
								value={filterParams.maxAmount || ''}
								onChange={(value) => handleFilterChange('maxAmount', value)}
								placeholder="0,00"
								formatCurrency
								currencySymbol="₺"
							/>
						</div>
					</div>

					{/* Installment Filters Section */}
					<div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-2 h-2 bg-purple-500 rounded-full"></div>
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">
								{t('filters.installmentFilters')}
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Input
								id="filterMinInstallment"
								label={t('filters.minInstallmentCount')}
								value={filterParams.minInstallmentCount || ''}
								onChange={(value) => handleFilterChange('minInstallmentCount', value)}
								placeholder="1"
								type="number"
								min={1}
							/>
							
							<Input
								id="filterMaxInstallment"
								label={t('filters.maxInstallmentCount')}
								value={filterParams.maxInstallmentCount || ''}
								onChange={(value) => handleFilterChange('maxInstallmentCount', value)}
								placeholder="12"
								type="number"
								min={1}
							/>
						</div>
					</div>

					{/* Date Filters Section */}
					<div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-2 h-2 bg-orange-500 rounded-full"></div>
							<h3 className="font-semibold text-slate-800 dark:text-slate-200">
								{t('filters.dateFilters')}
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<DatePicker
								id="filterStartDate"
								label={t('filters.startDate')}
								value={filterParams.startDate || ''}
								onChange={(value) => handleFilterChange('startDate', value)}
								placeholder={t('placeholders.selectStartDate')}
							/>
							
							<DatePicker
								id="filterEndDate"
								label={t('filters.endDate')}
								value={filterParams.endDate || ''}
								onChange={(value) => handleFilterChange('endDate', value)}
								placeholder={t('placeholders.selectEndDate')}
							/>
						</div>
					</div>

					{/* Active Filters Summary kaldırıldı: artık özet üst barda gösteriliyor */}
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

			{/* Borç Silme Modal */}
			<Modal 
				open={deleteModalOpen} 
				onClose={() => setDeleteModalOpen(false)} 
				title={t('modals.deleteDebt')}
				size="md"
				zIndex={10002}
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


