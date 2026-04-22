import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TagToolbar } from '@/components/tag/TagToolbar'
import { TagTable } from '@/components/tag/TagTable'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useListMyTagsQuery, useDeleteMyTagMutation } from '@/services/tagApi'
import { TagDTOs } from '@/types/index'

type SortablePageRequest = Required<Pick<TagDTOs.SortablePageRequest, 'pageNumber' | 'pageSize' | 'columnName' | 'asc'>>

type PageState = SortablePageRequest

export const TagsPage: React.FC = () => {
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

  const queryParams: TagDTOs.FilterRequest = useMemo(
    () => ({
      ...pageParams,
      name: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
    }),
    [pageParams, debouncedSearch]
  )

  const {
    data: tagsData,
    isLoading,
    isFetching,
    isError,
    refetch,
    error,
  } = useListMyTagsQuery(queryParams)

  const [deleteMyTag] = useDeleteMyTagMutation()

  const handleDelete = async (id: number) => {
    try {
      await deleteMyTag(id).unwrap()
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('tag.actions.deleteSuccess'), type: 'success' } })) } catch(_) {}
    } catch (err) {
      const message = (err as { data?: { message?: string } })?.data?.message || t('messages.operationFailed')
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message, type: 'error' } })) } catch(_) {}
      throw err
    }
  }

  const page = tagsData?.data
  const tags = page?.content ?? []

  const handlePageChange = (newPage: number) => {
    setPageParams((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageParams((prev) => ({ ...prev, pageSize: newPageSize, pageNumber: 0 }))
  }

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
            {t('pages.tags')}
          </h2>
        </div>

        <TagToolbar
          searchValue={search}
          onSearchChange={setSearch}
          onClearSearch={() => setSearch('')}
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
                  {t('tag.management.errorHint')}
                </div>
                <Button variant="primary" onClick={() => refetch()}>
                  {t('common.retry')}
                </Button>
              </div>
            </Card>
          ) : (
            <TagTable
              data={tags}
              isLoading={isLoading}
              pageParams={pageParams}
              totalPages={page?.totalPages ?? 0}
              totalRecords={page?.totalElements ?? 0}
              isFirstPage={page?.first}
              isLastPage={page?.last}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortClick={handleSortClick}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default TagsPage
