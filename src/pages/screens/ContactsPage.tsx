import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton, TableSkeleton, FormFieldSkeleton } from '@/components/ui/Skeleton'
import { useCreateContactMutation, useDeleteContactMutation, useListMyActiveContactsQuery, useUpdateMyContactMutation, SortablePageRequest } from '@/services/contactApi'
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

const columnHelper = createColumnHelper<Contact>()

export const ContactsPage: React.FC = () => {
  const { t } = useTranslation()
  
  // Sayfalama parametreleri
  const [pageParams, setPageParams] = useState<SortablePageRequest>({
    pageNumber: 0,
    pageSize: 10,
    columnName: 'id',
    asc: false
  })
  
  const { data, isLoading } = useListMyActiveContactsQuery(pageParams, {
    // Sadece gerekli olduğunda refetch yap
    refetchOnMountOrArgChange: false,
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
    setPageParams((prev: SortablePageRequest) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev: SortablePageRequest) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

  // Table bileşeninden gelen sıralama işlevi (sayfalama için)
  const handleSort = (columnName: string, asc: boolean) => {
    setPageParams((prev: SortablePageRequest) => ({ ...prev, columnName, asc, pageNumber: 0 }))
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
      header: t('table.actions'),
      cell: (info) => (
        <div className="flex items-center gap-2 justify-end">
          <Button 
            onClick={() => info.row.original.onEdit?.(info.row.original.id)} 
            variant="primary"
            className="px-3 py-1.5 text-sm"
          >
            {t('table.columns.edit')}
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
          <Button 
            onClick={() => { setForm({ fullName: '' }); setOpen(true) }} 
            variant="primary"
          >
            {t('buttons.newContact')}
          </Button>
        </div>

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
      </div>
    </div>
  )
}

export default ContactsPage


