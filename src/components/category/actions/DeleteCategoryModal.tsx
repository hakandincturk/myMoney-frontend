import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CategoryDTOs } from '@/types/category'

type DeleteCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  category: CategoryDTOs.ListItemWithMeta | null
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
}) => {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  if (!category) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onConfirm()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const hasTransactions = (category.transactionCount || 0) > 0

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('category.actions.deleteTitle', 'Kategoriyi Sil')}
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            {t('common.cancel', 'İptal')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500/50 dark:focus:ring-red-600/50 border-transparent text-white"
          >
            {isDeleting ? t('common.deleting', 'Siliniyor...') : t('common.delete', 'Sil')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-red-500 dark:text-red-400" />
        </div>
        
        <h4 className="text-xl font-semibold text-slate-900 dark:text-mm-text">
          {t('category.actions.deleteConfirmationTitle', 'Emin misiniz?')}
        </h4>
        
        <p className="text-slate-600 dark:text-mm-subtleText">
          <span className="font-semibold text-slate-900 dark:text-mm-text">“{category.name}”</span> {t('category.actions.deleteConfirmationBody', 'kategorisini silmek üzeresiniz. Bu işlem geri alınamaz.')}
        </p>

        {hasTransactions && (
          <div className="w-full p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-left">
            <p className="text-sm text-orange-800 dark:text-orange-200 flex gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5" />
              <span>
                {t('category.actions.hasTransactionsWarning', 'Bu kategoriye bağlı {{count}} işlem bulunmaktadır. Silme işlemi bu işlemleri de etkileyebilir.', { count: category.transactionCount })}
              </span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default DeleteCategoryModal
