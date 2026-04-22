import React, { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Table } from '@/components/ui/Table'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { TagDTOs } from '@/types/index'
import { TagActions } from './actions/TagActions'
import { ViewTagModal } from './actions/ViewTagModal'
import { RenameTagModal } from './actions/RenameTagModal'
import { DeleteTagModal } from './actions/DeleteTagModal'

type SortablePageRequest = TagDTOs.SortablePageRequest

type TagTableProps = {
  data: TagDTOs.ListItemWithMeta[]
  isLoading: boolean
  pageParams: SortablePageRequest
  totalPages: number
  totalRecords: number
  isFirstPage?: boolean
  isLastPage?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortClick: (columnName: string) => void
  onRename?: (id: number, newName: string) => Promise<void>
  onDelete?: (id: number) => Promise<void>
}

const columnHelper = createColumnHelper<TagDTOs.ListItemWithMeta>()

export const TagTable: React.FC<TagTableProps> = ({
  data,
  isLoading,
  pageParams,
  totalPages,
  totalRecords,
  isFirstPage,
  isLastPage,
  onPageChange,
  onPageSizeChange,
  onSortClick,
  onRename,
  onDelete,
}) => {
  const { t, i18n } = useTranslation()

  const [modalState, setModalState] = useState<{
    type: 'view' | 'rename' | 'delete' | null
    tag: TagDTOs.ListItemWithMeta | null
  }>({ type: null, tag: null })

  const closeModal = () => setModalState({ type: null, tag: null })

  const handleRenameConfirm = async (newName: string) => {
    if (modalState.tag && onRename) {
      await onRename(modalState.tag.id, newName)
    }
  }

  const handleDeleteConfirm = async () => {
    if (modalState.tag && onDelete) {
      await onDelete(modalState.tag.id)
    }
  }

  const getSortIndicator = (columnName: string) => {
    if (pageParams.columnName !== columnName) return null

    if (pageParams.asc) {
      return <span className="text-xs font-bold text-blue-600">↑</span>
    }

    return <span className="text-xs font-bold text-red-600">↓</span>
  }

  const columns = [
    columnHelper.accessor('name', {
      header: () => (
        <button
          onClick={() => onSortClick('name')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.tagName')}
          {getSortIndicator('name')}
        </button>
      ),
      cell: (info) => (
        <span className="font-medium text-slate-900 dark:text-mm-text">{info.getValue()}</span>
      ),
      meta: { className: 'min-w-[200px]' },
    }),
    columnHelper.accessor('createdAt', {
      header: () => (
        <button
          onClick={() => onSortClick('createdAt')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.createdAt')}
          {getSortIndicator('createdAt')}
        </button>
      ),
      cell: (info) => {
        const value = info.getValue()
        if (!value) return <span className="text-slate-400 dark:text-mm-placeholder">—</span>
        const date = new Date(value)
        const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US'
        return (
          <span className="text-slate-700 dark:text-mm-subtleText">
            {date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: '2-digit' })}
          </span>
        )
      },
      meta: { className: 'min-w-[140px]' },
    }),
    columnHelper.accessor('transactionCount', {
      header: () => (
        <button
          onClick={() => onSortClick('transactionCount')}
          className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-mm-text transition-colors w-full text-left"
        >
          {t('table.columns.transactionCount')}
          {getSortIndicator('transactionCount')}
        </button>
      ),
      cell: (info) => {
        const count = Number(info.getValue() ?? 0)
        const tone = count > 0
          ? 'bg-mm-light-secondary/20 text-mm-light-secondary border-mm-light-secondary/30 dark:bg-mm-secondary/20 dark:text-mm-secondary dark:border-mm-secondary/30'
          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-mm-subtleText dark:border-mm-border'

        return (
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border ${tone}`}>
            {count}
          </span>
        )
      },
      meta: { className: 'min-w-[140px] text-left' },
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions.title', 'İşlemler')}</span>,
      cell: (info) => (
        <TagActions
          onView={() => setModalState({ type: 'view', tag: info.row.original })}
          onRename={() => setModalState({ type: 'rename', tag: info.row.original })}
          onDelete={() => setModalState({ type: 'delete', tag: info.row.original })}
        />
      ),
      meta: { className: 'w-[140px]' },
    }),
  ]

  if (isLoading) {
    return <TableSkeleton columns={3} rows={6} />
  }

  return (
    <>
      <Table
        data={data}
        columns={columns}
        showPagination={true}
        pageSize={pageParams.pageSize}
        currentPage={pageParams.pageNumber}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        className="h-full"
      />

      <ViewTagModal
        isOpen={modalState.type === 'view'}
        onClose={closeModal}
        tag={modalState.tag}
      />

      <RenameTagModal
        isOpen={modalState.type === 'rename'}
        onClose={closeModal}
        onConfirm={handleRenameConfirm}
        tag={modalState.tag}
      />

      <DeleteTagModal
        isOpen={modalState.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        tag={modalState.tag}
      />
    </>
  )
}

export default TagTable
