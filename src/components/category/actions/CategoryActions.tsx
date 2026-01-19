import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

type CategoryActionsProps = {
  onView: () => void
  onRename: () => void
  onDelete: () => void
}

export const CategoryActions: React.FC<CategoryActionsProps> = ({
  onView,
  onRename,
  onDelete,
}) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        onClick={onView}
        variant="secondary"
        className="px-4 py-2 border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {t('common.actions.view', 'İncele')}
      </Button>
      
      <Button
        onClick={onRename}
        variant="secondary"
        className="px-4 py-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
      >
        {t('common.actions.rename', 'Yeniden Adlandır')}
      </Button>
      
      <Button
        onClick={onDelete}
        variant="primary"
        className="px-4 py-2 bg-red-500 hover:bg-red-600 border-transparent dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500/50"
      >
        {t('common.actions.delete', 'Sil')}
      </Button>
    </div>
  )
}

export default CategoryActions

