import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CategoryToolbar } from '@/components/category/CategoryToolbar'
import { CategoryTable } from '@/components/category/CategoryTable'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useListMyCategoriesQuery } from '@/services/categoryApi'
import { CategoryDTOs } from '@/types/index'

type SortablePageRequest = Required<Pick<CategoryDTOs.SortablePageRequest, 'pageNumber' | 'pageSize' | 'columnName' | 'asc'>>

type PageState = SortablePageRequest

export const CategoriesPage: React.FC = () => {
  const { t } = useTranslation()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [pageParams, setPageParams] = useState<PageState>({
    pageNumber: 0,
    pageSize: 10,
    columnName: 'id',
    asc: false,
  })

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPageParams((p) => ({ ...p, pageNumber: 0 }))
    }, 350)

    return () => window.clearTimeout(handle)
  }, [search])

  const queryParams: CategoryDTOs.FilterRequest = useMemo(
    () => ({
      ...pageParams,
      name: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    }),
    [pageParams, debouncedSearch]
  )

  const {
    data: categoriesData,
    isLoading,
    isFetching,
    isError,
    refetch,
    error,
  } = useListMyCategoriesQuery(queryParams)

  const page = categoriesData?.data
  const categories = page?.content ?? []

  const handlePageChange = (newPage: number) => {
    setPageParams((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

  // 3 aşamalı sıralama: ASC -> DESC -> Default (id, DESC)
  const handleSortClick = (columnName: string) => {
    setPageParams((prev) => {
      if (prev.columnName === columnName) {
        if (prev.asc === true) {
          return { ...prev, asc: false }
        }

        return { ...prev, columnName: 'id', asc: false, pageNumber: 0 }
      }

      return { ...prev, columnName, asc: true, pageNumber: 0 }
    })
  }

  const errorMessage = useMemo(() => {
    const maybeMsg = (error as any)?.data?.message
    return maybeMsg || t('messages.operationFailed')
  }, [error, t])

  return (
    <div className="h-screen w-full bg-mm-light-bg dark:bg-mm-bg px-4 sm:px-6 md:px-8 py-6 relative z-0 flex flex-col min-h-0 box-border">
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-mm-light-text dark:text-mm-text">
            {t('pages.categories')}
          </h2>

          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            title={t('common.refresh')}
          >
            {t('common.refresh')}
          </Button>
        </div>

        <CategoryToolbar
          searchValue={search}
          onSearchChange={setSearch}
          onClearSearch={() => setSearch('')}
          totalRecords={page?.totalElements}
          isLoading={isFetching}
          onRefresh={() => refetch()}
        />

        <div className="flex-1 flex flex-col min-h-0">
          {isError ? (
            <Card
              title={t('common.error')}
              subtitle={errorMessage}
              className="border-red-200 dark:border-red-900/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-600 dark:text-mm-subtleText">
                  {t('category.management.errorHint')}
                </div>
                <Button variant="primary" onClick={() => refetch()}>
                  {t('common.retry')}
                </Button>
              </div>
            </Card>
          ) : (
            <CategoryTable
              data={categories}
              isLoading={isLoading}
              pageParams={pageParams}
              totalPages={page?.totalPages ?? 0}
              totalRecords={page?.totalElements ?? 0}
              isFirstPage={page?.first}
              isLastPage={page?.last}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortClick={handleSortClick}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage
