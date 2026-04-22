import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TagDTOs } from '@/types/tag'

type RenameTagModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newName: string) => Promise<void>
  tag: TagDTOs.ListItemWithMeta | null
}

export const RenameTagModal: React.FC<RenameTagModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tag,
}) => {
  const { t } = useTranslation()
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && tag) {
      setNewName(tag.name)
      setError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, tag])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!newName.trim()) {
      return
    }

    if (newName.trim() === tag?.name) {
      onClose()
      return
    }

    try {
      setIsSubmitting(true)
      await onConfirm(newName.trim())
      onClose()
    } catch (err) {
      console.error(err)
      setError(t('common.genericError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t('tag.actions.renameTitle')}
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !newName.trim() || newName.trim() === tag?.name}
          >
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-mm-subtleText">
          {t('tag.actions.renameDescription')}
        </p>

        <Input
          id="tag-rename-input"
          value={newName}
          onChange={(val) => setNewName(String(val))}
          label={t('tag.fields.name')}
          placeholder={t('tag.fields.namePlaceholder')}
          error={error || undefined}
          autoFocus
        />
      </form>
    </Modal>
  )
}

export default RenameTagModal
