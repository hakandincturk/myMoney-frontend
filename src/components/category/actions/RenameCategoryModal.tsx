import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CategoryDTOs } from '@/types/category'

type RenameCategoryModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => Promise<void>
  category: CategoryDTOs.ListItemWithMeta | null
}

export const RenameCategoryModal: React.FC<RenameCategoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  category,
}) => {
  const { t } = useTranslation()
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && category) {
      setNewName(category.name)
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, category])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!newName.trim()) {
      // setError(t('validation.required', 'Bu alan zorunludur'));
      return
    }

    if (newName.trim() === category?.name) {
      onClose()
      return
    }

    try {
      setIsSubmitting(true)
      await onConfirm(newName.trim())
      onClose()
    } catch (err) {
      // Hata yönetimi (gerçek uygulamada API'den gelen hata mesajı)
      console.error(err)
      setError(t('common.genericError', 'Bir hata oluştu'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('category.actions.renameTitle', 'Kategoriyi Yeniden Adlandır')}
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', 'İptal')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => handleSubmit()} 
            disabled={isSubmitting || !newName.trim() || newName.trim() === category?.name}
          >
            {isSubmitting ? t('common.saving', 'Kaydediliyor...') : t('common.save', 'Kaydet')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-mm-subtleText">
          {t('category.actions.renameDescription', 'Kategori adını aşağıdan güncelleyebilirsiniz.')}
        </p>
        
        <Input
          id="category-rename-input"
          value={newName}
          onChange={(val) => setNewName(String(val))}
          label={t('category.fields.name', 'Kategori Adı')}
          placeholder={t('category.fields.namePlaceholder', 'Kategori adı giriniz')}
          error={error || undefined}
          autoFocus
        />
      </form>
    </Modal>
  )
}

export default RenameCategoryModal
