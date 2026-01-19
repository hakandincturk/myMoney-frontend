import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CategoryDTOs } from '@/types/category'

type ViewCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  category: CategoryDTOs.ListItemWithMeta | null
}

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { t, i18n } = useTranslation()

  if (!category) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US'
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('category.actions.viewTitle', 'Kategori Detayları')}
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="secondary" onClick={onClose}>
            {t('common.close', 'Kapat')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
            <h4 className="text-sm font-medium text-slate-500 dark:text-mm-subtleText mb-1">
                {t('category.fields.name', 'Kategori Adı')}
            </h4>
            <div className="text-lg font-semibold text-slate-900 dark:text-mm-text">
                {category.name}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
                <h4 className="text-sm font-medium text-slate-500 dark:text-mm-subtleText mb-1">
                    {t('category.fields.transactionCount', 'İşlem Sayısı')}
                </h4>
                <div className="text-2xl font-bold text-mm-secondary">
                    {category.transactionCount || 0}
                </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-mm-border">
                <h4 className="text-sm font-medium text-slate-500 dark:text-mm-subtleText mb-1">
                    {t('category.fields.createdAt', 'Oluşturulma Tarihi')}
                </h4>
                <div className="text-sm font-medium text-slate-900 dark:text-mm-text">
                    {formatDate(category.createdAt)}
                </div>
            </div>
        </div>
      </div>
    </Modal>
  )
}

export default ViewCategoryModal
