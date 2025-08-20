import React, { useMemo, useState } from 'react'
import { useCreateContactMutation, useDeleteContactMutation, useListMyActiveContactsQuery, useUpdateMyContactMutation } from '@/services/contactApi'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { createColumnHelper } from '@tanstack/react-table'
import { Input } from '@/components/ui/Input'
import { useTranslation } from 'react-i18next'

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
  const { data } = useListMyActiveContactsQuery()
  const [createContact] = useCreateContactMutation()
  const [updateMyContact] = useUpdateMyContactMutation()
  const [deleteContact] = useDeleteContactMutation()
  const [form, setForm] = useState<{ id?: number; fullName: string; note?: string }>({ fullName: '' })
  const [open, setOpen] = useState(false)

  const handleEdit = (id: number) => {
    const c = contacts.find((x) => x.id === id)
    if (c) {
      setForm({ id: c.id, fullName: c.fullName, note: c.note })
      setOpen(true)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteContact({ contactId: id })
    if (form.id === id) setForm({ fullName: '' })
  }

  const contacts = useMemo(() => {
    if (!data?.data) return []
    
    return data.data.map(contact => ({
      ...contact,
      onEdit: handleEdit,
      onDelete: handleDelete,
    }))
  }, [data, handleEdit, handleDelete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName?.trim()) return
    
    if (form.id) {
      await updateMyContact({ contactId: form.id, body: { fullName: form.fullName, note: form.note } })
    } else {
      await createContact({ fullName: form.fullName, note: form.note })
    }
    setForm({ fullName: '' })
    setOpen(false)
  }

  const columns = [
    columnHelper.accessor('fullName', {
      header: t('table.columns.fullName'),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('note', {
      header: t('table.columns.note'),
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

        <Table 
          data={contacts} 
          columns={columns} 
          title={t('table.titles.contactList')}
          showPagination={contacts.length > 10}
          pageSize={10}
        />

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


