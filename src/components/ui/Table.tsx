import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useTranslation } from 'react-i18next'

type TableProps<T> = {
  data: T[]
  columns: any[]
  className?: string
  title?: string
  showPagination?: boolean
  pageSize?: number
}

export const Table = <T extends object>({ 
  data, 
  columns, 
  className = '', 
  title,
  showPagination = true,
  pageSize = 10
}: TableProps<T>) => {
  const { t } = useTranslation()
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize)
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0)
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: currentPageIndex,
        pageSize: currentPageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: currentPageIndex, pageSize: currentPageSize })
        setCurrentPageSize(newState.pageSize)
        setCurrentPageIndex(newState.pageIndex)
      } else if (typeof updater === 'object') {
        setCurrentPageSize(updater.pageSize || currentPageSize)
        setCurrentPageIndex(updater.pageIndex || currentPageIndex)
      }
    },
  })

  return (
    <div className={`bg-white dark:bg-mm-card rounded-xl border border-slate-200 dark:border-mm-border overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-mm-border">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-mm-text">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-mm-bg">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-mm-subtleText uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-mm-border">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="hover:bg-slate-50 dark:hover:bg-mm-cardHover transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-slate-900 dark:text-mm-text">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-mm-border bg-slate-50 dark:bg-mm-bg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-mm-subtleText">
                <span>
                  {t('table.pagination.page')} {table.getState().pagination.pageIndex + 1} {t('table.pagination.of')} {table.getPageCount()}
                </span>
                <span>•</span>
                <span>
                  {t('table.pagination.totalRecords')} {table.getFilteredRowModel().rows.length}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-mm-subtleText whitespace-nowrap">
                  {t('table.pagination.recordsPerPage')}:
                </span>
                <Select
                  id="pageSize"
                  value={currentPageSize}
                  onChange={(value) => {
                    const newPageSize = Number(value)
                    setCurrentPageSize(newPageSize)
                    setCurrentPageIndex(0)
                  }}
                  options={[
                    { value: 10, label: '10' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 100, label: '100' }
                  ]}
                  className="w-24"
                  dropdownDirection="up"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setCurrentPageIndex(Math.max(0, currentPageIndex - 1))
                }}
                disabled={currentPageIndex === 0}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {t('buttons.previous')}
              </Button>
              <Button
                onClick={() => {
                  setCurrentPageIndex(Math.min(table.getPageCount() - 1, currentPageIndex + 1))
                }}
                disabled={currentPageIndex >= table.getPageCount() - 1}
                variant="secondary"
                className="px-3 py-1.5 text-sm"
              >
                {t('buttons.next')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
