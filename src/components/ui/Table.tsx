import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useTranslation } from 'react-i18next'

type TableProps<T> = {
  data: T[]
  columns: ColumnDef<T, any>[]
  className?: string
  title?: string
  showPagination?: boolean
  pageSize?: number
  currentPage?: number
  totalPages?: number
  totalRecords?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  onSort?: (columnName: string, asc: boolean) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  isFirstPage?: boolean
  isLastPage?: boolean
}

export const Table = <T extends object>({ 
  data, 
  columns, 
  className = '', 
  title,
  showPagination = true,
  pageSize = 10,
  currentPage = 0,
  totalPages = 0,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortColumn,
  sortDirection = 'desc',
  isFirstPage,
  isLastPage
}: TableProps<T>) => {
  const { t } = useTranslation()
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Dışarıdan kontrol edilen sayfalama: tablo kendi kendine sayfayı değiştirmesin
    manualPagination: true,
    autoResetPageIndex: false,
    state: {
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
  })

  // Sayfa değişikliği
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  // Sayfa boyutu değişikliği
  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize)
    }
  }

  // Sütun sıralama
  const handleSort = (columnName: string) => {
    if (onSort) {
      const newAsc = sortColumn === columnName ? !sortDirection || sortDirection === 'desc' : true
      onSort(columnName, newAsc)
    }
  }

  return (
  <div className={`bg-white dark:bg-mm-card rounded-xl border border-slate-200 dark:border-mm-border overflow-hidden flex flex-col min-h-0 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-mm-border flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-mm-text">{title}</h3>
        </div>
      )}

      {/* Table area: make it grow and be scrollable */}
  <div className="flex-1 overflow-auto custom-scrollbar min-h-0 relative">
        <div className="min-w-max">
          <table className="table-auto border-separate border-spacing-0 min-w-max w-full">
            <thead className="bg-slate-50 dark:bg-mm-bg sticky top-0 z-20 border-b border-slate-200 dark:border-mm-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase tracking-wider whitespace-nowrap sticky top-0 z-20 bg-slate-50 dark:bg-mm-bg"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="relative hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-slate-200 dark:after:bg-mm-border"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="align-middle">
                      <div className="px-6 py-4 w-full text-sm text-slate-900 dark:text-mm-text whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPagination && (
      <div className="px-6 py-4 overflow-visible border-t border-slate-100 dark:border-mm-border bg-slate-50 dark:bg-mm-bg flex-shrink-0">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="min-w-max flex flex-nowrap items-center justify-between gap-6 pr-1">
            <div className="flex items-center gap-4 whitespace-nowrap">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-mm-subtleText">
                <span>
                  {t('table.pagination.page')} {currentPage + 1} {t('table.pagination.of')} {totalPages || table.getPageCount()}
                </span>
                <span>•</span>
                <span>
                  {t('table.pagination.totalRecords')} {totalRecords || table.getFilteredRowModel().rows.length}
                </span>
              </div>
              
              <div className="flex items-center gap-3 relative z-20">
                <span className="text-sm text-slate-500 dark:text-mm-subtleText whitespace-nowrap">
                  {t('table.pagination.recordsPerPage')}:
                </span>
                <Select
                  id="pageSize"
                  value={pageSize}
                  onChange={(value) => handlePageSizeChange(Number(value))}
                  options={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  className="w-24"
                  dropdownDirection="up"
                  usePortal
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={isFirstPage !== undefined ? isFirstPage : currentPage === 0}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {t('buttons.previous')}
              </Button>
              <Button
                onClick={() => handlePageChange(Math.min((totalPages || table.getPageCount()) - 1, currentPage + 1))}
                disabled={isLastPage !== undefined ? isLastPage : currentPage >= (totalPages || table.getPageCount()) - 1}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {t('buttons.next')}
              </Button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
