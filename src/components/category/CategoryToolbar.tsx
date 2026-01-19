import React from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type CategoryToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  totalRecords?: number
  isLoading?: boolean
  onClearSearch?: () => void
  onRefresh?: () => void
}

export const CategoryToolbar: React.FC<CategoryToolbarProps> = ({
  searchValue,
  onSearchChange,
  totalRecords,
  isLoading,
  onClearSearch,
  onRefresh,
}) => {
  const { t } = useTranslation()

  const hasSearch = Boolean(searchValue && searchValue.trim())

  return (
    <Card
      className="mb-4"
      title={t('category.management.title')}
      subtitle={t('category.management.subtitle')}
      subtitleHelp={t('category.management.subtitleHelp')}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              id="categorySearch"
              label={t('category.search.label')}
              value={searchValue}
              onChange={(v) => onSearchChange(String(v))}
              placeholder={t('category.search.placeholder')}
              className="max-w-xl"
            />
          </div>

          <div className="flex gap-2">
            {hasSearch && (
              <Button
                variant="secondary"
                onClick={onClearSearch}
                className="whitespace-nowrap"
              >
                {t('common.clear')}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={onRefresh}
              disabled={isLoading}
              className="whitespace-nowrap"
              title={t('common.refresh')}
            >
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
            <span className="font-medium">{t('category.kpis.total')}</span>
            <span className="font-semibold">{typeof totalRecords === 'number' ? totalRecords : '—'}</span>
          </span>
          {hasSearch && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mm-light-cardHover text-slate-700 border border-mm-light-border dark:bg-slate-800 dark:text-mm-subtleText dark:border-mm-border">
              <span className="font-medium">{t('category.kpis.filteredBy')}</span>
              <span className="font-semibold">“{searchValue.trim()}”</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export default CategoryToolbar
