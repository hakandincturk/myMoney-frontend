import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton, TableSkeleton, FormFieldSkeleton } from '@/components/ui/Skeleton'
import { FilterChips } from '@/components/ui/FilterChips'
import { useCreateContactMutation, useDeleteContactMutation, useListMyActiveContactsQuery, useUpdateMyContactMutation, SortablePageRequest, ContactFilterRequestDto } from '@/services/contactApi'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { useToast } from '../../hooks/useToast'


type Contact = {
  id: number
  fullName: string
  note?: string
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

// Contact Filter Request DTO tipini import'tan kullan
type ContactFilterRequest = ContactFilterRequestDto

const columnHelper = createColumnHelper<Contact>()

export const ContactsPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL'den filtreleri oku
  const loadFiltersFromURL = useCallback((): ContactFilterRequest => {
    const params = new URLSearchParams(searchParams)
    
    const result = {
      pageNumber: parseInt(params.get('page') || '0') || 0,
      pageSize: parseInt(params.get('size') || '10') || 10,
      columnName: params.get('sort') || 'id',
      asc: params.get('direction') === 'asc',
      fullName: params.get('fullName') || '',
      note: params.get('note') || ''
    }
    
    return result
  }, [searchParams])

  // Filtreleri URL'ye yaz
  const syncFiltersToURL = useCallback((filters: ContactFilterRequest) => {
    const params = new URLSearchParams()
    
    // Sadece boş olmayan değerleri URL'ye ekle
    if (filters.pageNumber && filters.pageNumber > 0) params.set('page', filters.pageNumber.toString())
    if (filters.pageSize && filters.pageSize !== 10) params.set('size', filters.pageSize.toString())
    if (filters.columnName && filters.columnName !== 'id') params.set('sort', filters.columnName)
    if (filters.asc !== undefined && filters.asc !== false) params.set('direction', 'asc')
    if (filters.fullName && filters.fullName.trim()) params.set('fullName', filters.fullName.trim())
    if (filters.note && filters.note.trim()) params.set('note', filters.note.trim())
    
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
  const [filterParams, setFilterParams] = useState<ContactFilterRequest>(() => {
    return loadFiltersFromURL()
  })

  // Filter modal state'i
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  
  // Uygulanan filtreler state'i (tablo üstünde gösterilecek) - URL'den yüklenecek
  const [appliedFilters, setAppliedFilters] = useState<ContactFilterRequest>(() => {
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
  
  const { data, isLoading } = useListMyActiveContactsQuery(appliedFilters, {
    // Parametre değiştiğinde mutlaka yeniden istekte bulun
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
  })
  const [createContact] = useCreateContactMutation()
  const [updateMyContact] = useUpdateMyContactMutation()
  const [deleteContact] = useDeleteContactMutation()
  const { showToast } = useToast()
  const [form, setForm] = useState<{ id?: number; fullName: string; note?: string }>({ fullName: '' })
  const [open, setOpen] = useState(false)
  
  // Modal açıldığında ilk input'a focus olmak için ref
  const fullNameInputRef = useRef<HTMLInputElement>(null)

  // Modal açıldığında ilk input'a focus ol
  useEffect(() => {
    if (open && fullNameInputRef.current) {
      // Kısa bir gecikme ile focus ol (modal animasyonu tamamlandıktan sonra)
      setTimeout(() => {
        fullNameInputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Sayfalama işlemleri
  const handlePageChange = (newPage: number) => {
    const newParams = { ...pageParams, pageNumber: newPage }
    setPageParams(newParams)
    // URL'yi güncelle
    syncFiltersToURL({ ...appliedFilters, ...newParams })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const newParams = { ...pageParams, pageSize: newPageSize, pageNumber: 0 }
    setPageParams(newParams)
    // URL'yi güncelle
    syncFiltersToURL({ ...appliedFilters, ...newParams })
  }

  // Table bileşeninden gelen sıralama işlevi (sayfalama için)
  const handleSort = (columnName: string, asc: boolean) => {
    const newParams = { ...pageParams, columnName, asc, pageNumber: 0 }
    setPageParams(newParams)
    // URL'yi güncelle
    syncFiltersToURL({ ...appliedFilters, ...newParams })
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
      
      // URL'yi güncelle
      syncFiltersToURL({ ...appliedFilters, ...newParams })
      return newParams
    })
  }

  // Filter işlemleri
  const handleFilterChange = (key: keyof ContactFilterRequest, value: any) => {
    // 0 değerlerini undefined olarak set et
    if (value === 0 || value === '0') {
      setFilterParams(prev => ({ ...prev, [key]: undefined }))
    } else {
      setFilterParams(prev => ({ ...prev, [key]: value }))
    }
  }

  const applyFilters = () => {
    // Filter parametrelerini sayfalama parametreleriyle birleştir
    const combinedParams: ContactFilterRequest = {
      ...filterParams,
      pageNumber: 0, // Filter uygulandığında ilk sayfaya dön
      pageSize: pageParams.pageSize,
      columnName: pageParams.columnName,
      asc: pageParams.asc
    }
    
    // Boş değerleri temizle
    Object.keys(combinedParams).forEach(key => {
      const k = key as keyof ContactFilterRequest
      if (combinedParams[k] === '' || combinedParams[k] === undefined) {
        delete combinedParams[k]
      }
    })

    // Uygulanan filtre özetini güncelle (sadece temizlenmiş parametrelerle)
    setAppliedFilters(combinedParams)
    
    setPageParams(combinedParams)
    setFilterModalOpen(false)
    
    // URL'yi güncelle
    syncFiltersToURL(combinedParams)
  }

  const clearFilters = () => {
    const defaultFilters: ContactFilterRequest = {
      pageNumber: 0,
      pageSize: 10,
      columnName: 'id',
      asc: false,
      fullName: '',
      note: ''
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
    const hasFullName = filterParams.fullName && filterParams.fullName.trim() !== ''
    const hasNote = filterParams.note && filterParams.note.trim() !== ''

    return hasFullName || hasNote
  }

  // Uygulanan filtrelerde aktif olan var mı?
  const hasAppliedActiveFilters = () => {
    const hasFullName = appliedFilters.fullName && appliedFilters.fullName.trim() !== ''
    const hasNote = appliedFilters.note && appliedFilters.note.trim() !== ''

    return hasFullName || hasNote
  }

  // Üst bardan chip kaldırma: hem appliedFilters hem filterParams temizlenir ve istek tekrar atılır
  const removeAppliedFilter = (key: keyof ContactFilterRequest) => {
    const nextApplied: ContactFilterRequest = { ...appliedFilters }
    const nextFilter: ContactFilterRequest = { ...filterParams }

    if (key === 'fullName' || key === 'note') {
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



  const contacts = useMemo(() => {
    if (!data?.data?.content) return []
    
    return data.data.content.map(contact => ({
      ...contact,
      onEdit: (id: number) => {
        const c = data.data.content.find((x: any) => x.id === id)
        if (c) {
          setForm({ id: c.id, fullName: c.fullName, note: c.note })
          setOpen(true)
        }
      },
      onDelete: async (id: number) => {
        try {
          const result = await deleteContact({ contactId: id }).unwrap()
          if (result && result.type === true) {
            if (form.id === id) setForm({ fullName: '' })
            showToast(t('messages.contactDeleted'), 'success')
          }
        } catch (error) {
          // Hata durumunda işlem yapılmaz
          console.error('Contact deletion failed:', error)
          const errorMessage = (error as any)?.data?.message || t('messages.operationFailed')
          showToast(errorMessage, 'error')
        }
      },
    }))
  }, [data, deleteContact, form.id, showToast, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName?.trim()) return
    
    try {
      if (form.id) {
        const updateResult = await updateMyContact({ contactId: form.id, body: { fullName: form.fullName, note: form.note } }).unwrap()
        if (updateResult && updateResult.type === true) {
          setForm({ fullName: '' })
          setOpen(false)
          showToast(t('messages.contactUpdated'), 'success')
        }
      } else {
        const createResult = await createContact({ fullName: form.fullName, note: form.note }).unwrap()
        if (createResult && createResult.type === true) {
          setForm({ fullName: '' })
          setOpen(false)
          showToast(t('messages.contactCreated'), 'success')
        }
      }
    } catch (error) {
      // Hata durumunda modal açık kalır, kullanıcı düzeltebilir
      console.error('Contact operation failed:', error)
      const errorMessage = (error as any)?.data?.message || t('messages.operationFailed')
      showToast(errorMessage, 'error')
    }
  }

  const columns = [
    columnHelper.accessor('fullName', {
      header: () => (
        <button
          onClick={() => handleSortClick('fullName')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.fullName')}
          {pageParams.columnName === 'fullName' && (
            <span className={`text-xs font-bold ${pageParams.asc ? 'text-blue-600' : 'text-red-600'}`}>
              {pageParams.asc ? '↑' : '↓'}
            </span>
          )}
        </button>
      ),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('note', {
      header: () => (
        <button
          onClick={() => handleSortClick('note')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.note')}
          {pageParams.columnName === 'note' && (
            <span className={`text-xs font-bold ${pageParams.asc ? 'text-blue-600' : 'text-red-600'}`}>
              {pageParams.asc ? '↑' : '↓'}
            </span>
          )}
        </button>
      ),
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.columns.actions'),
      cell: (info) => (
        <div className="flex items-center gap-2 justify-end">
          <Button 
            onClick={() => info.row.original.onEdit?.(info.row.original.id)} 
            variant="primary"
            className="px-3 py-1.5 text-sm"
          >
            {t('buttons.edit')}
          </Button>
          <Button 
            onClick={() => info.row.original.onDelete?.(info.row.original.id)} 
            variant="secondary"
            className="px-3 py-1.5 text-sm text-red-600 border-red-600 hover:bg-red-50 hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-700 dark:hover:border-red-700"
          >
            {t('table.columns.delete')}
          </Button>
        </div>
      ),
    }),
  ]

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-mm-text">{t('pages.contacts')}</h2>
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
                    if (filterParams.fullName && filterParams.fullName.trim() !== '') count++
                    if (filterParams.note && filterParams.note.trim() !== '') count++
                    return count
                  })()}
                </span>
              )}
            </Button>
            <Button 
              onClick={() => { setForm({ fullName: '' }); setOpen(true) }} 
              variant="primary"
            >
              {t('buttons.newContact')}
            </Button>
          </div>
        </div>

        {/* Uygulanan Akıllı Filtre Özeti - Tablo üstünde göster */}
        {hasAppliedActiveFilters() && (
          <FilterChips
            appliedFilters={appliedFilters}
            onRemoveKey={removeAppliedFilter}
            onRemoveItem={() => {}} // Contact filtreleri çoklu seçim desteklemiyor
            accountIdToName={{}}
            contactIdToName={{}}
            getTypeLabel={() => ''}
          />
        )}

        {isLoading ? (
          <TableSkeleton columns={3} rows={5} />
        ) : (
          <Table 
            data={contacts} 
            columns={columns} 
            title={t('table.titles.contactList')}
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
        )}

        <Modal 
          open={open} 
          onClose={() => setOpen(false)} 
          title={form.id ? t('modals.editContact') : t('modals.newContact')}
          footer={(
            <div className="flex justify-end gap-2">
              <Button 
                onClick={() => setOpen(false)} 
                variant="secondary"
              >
                {t('buttons.cancel')}
              </Button>
              <Button 
                onClick={handleSubmit as unknown as () => void} 
                variant="primary"
              >
                {t('buttons.save')}
              </Button>
            </div>
          )}
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <Input
              id="fullName"
              label={t('table.columns.fullName')}
              value={form.fullName}
              onChange={(value) => setForm((p) => ({ ...p, fullName: value as string }))}
              placeholder={t('placeholders.fullName')}
              required
              ref={fullNameInputRef}
            />
            <Input
              id="note"
              label={t('table.columns.note')}
              value={form.note ?? ''}
              onChange={(value) => setForm((p) => ({ ...p, note: value as string }))}
              placeholder={t('placeholders.note')}
            />
          </form>
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
                    if (filterParams.fullName && filterParams.fullName.trim() !== '') count++
                    if (filterParams.note && filterParams.note.trim() !== '') count++
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
            {/* Contact Filters Section */}
            <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('filters.contactFilters')}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  id="filterFullName"
                  label={t('filters.fullName')}
                  value={filterParams.fullName || ''}
                  onChange={(value) => handleFilterChange('fullName', value)}
                  placeholder={t('placeholders.searchByFullName')}
                />
                
                <Input
                  id="filterNote"
                  label={t('filters.note')}
                  value={filterParams.note || ''}
                  onChange={(value) => handleFilterChange('note', value)}
                  placeholder={t('placeholders.searchByNote')}
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default ContactsPage


