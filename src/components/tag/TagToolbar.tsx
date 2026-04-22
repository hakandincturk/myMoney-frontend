import React from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type TagToolbarProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onClearSearch?: () => void
  onRefresh?: () => void
}

export const TagToolbar: React.FC<TagToolbarProps> = ({
  searchValue,
  onSearchChange,
  isLoading,
  onClearSearch,
  onRefresh,
}) => {
  const { t } = useTranslation()

  const hasSearch = Boolean(searchValue && searchValue.trim())

  return (
    <Card
      className="mb-3"
      contentClassName="p-3"
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row gap-2 md:items-end md:justify-between">
          <div className="flex-1">
            <Input
              id="tagSearch"
              value={searchValue}
              onChange={(v) => onSearchChange(String(v))}
              placeholder={t('tag.search.placeholder')}
              className="max-w-xl"
              size="sm"
            />
          </div>

          <div className="flex gap-2">
            {hasSearch && (
              <Button
                variant="secondary"
                onClick={onClearSearch}
                className="whitespace-nowrap"
                size="sm"
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
              size="sm"
            >
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {hasSearch && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-mm-light-cardHover text-slate-700 border border-mm-light-border dark:bg-slate-800 dark:text-mm-subtleText dark:border-mm-border">
              <span className="font-medium">{t('tag.kpis.filteredBy')}</span>
              <span className="font-semibold">"{searchValue.trim()}"</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TagToolbar
