import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useListMyActiveTagsQuery, useUpdateTransactionTagsMutation } from '@/services/tagApi'
import { TransactionDTOs } from '@/types/index'
import { isSameText } from '@/utils/textMatch'

type TransactionTagEditorProps = {
  transactionId: number
  tags: TransactionDTOs.TagInfo[]
  onUpdated: (tags: TransactionDTOs.TagInfo[]) => void
}

type TagOption = { value: string | number; label: string }

/**
 * Shows a transaction's tags and lets the user replace them in place.
 * Typed names that match an existing tag are reused by the server, so no duplicate tag is ever created.
 */
export const TransactionTagEditor: React.FC<TransactionTagEditorProps> = ({ transactionId, tags, onUpdated }) => {
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [tagIds, setTagIds] = useState<number[]>([])
  const [newTags, setNewTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const { data: activeTagsData } = useListMyActiveTagsQuery({ pageNumber: 0, pageSize: 100 }, { skip: !isEditing })
  const [updateTransactionTags, { isLoading: isSaving }] = useUpdateTransactionTagsMutation()

  // Current tags are merged in so they still render when they fall outside the first page of active tags
  const options = useMemo<TagOption[]>(() => {
    const merged: TagOption[] = (activeTagsData?.data?.content ?? []).map((tag) => ({ value: tag.id, label: tag.name }))
    tags.forEach((tag) => {
      if (!merged.some((option) => option.value === tag.id)) merged.push({ value: tag.id, label: tag.name })
    })
    newTags.forEach((name) => merged.push({ value: name, label: name }))
    return merged
  }, [activeTagsData, tags, newTags])

  const startEditing = () => {
    setTagIds(tags.map((tag) => tag.id))
    setNewTags([])
    setError(null)
    setIsEditing(true)
  }

  const handleCreate = (label: string) => {
    // A typed name that matches a loaded tag selects that tag instead of queueing a new one
    const existing = options.find((option) => typeof option.value === 'number' && isSameText(option.label, label))
    if (existing) {
      setTagIds((prev) => (prev.includes(existing.value as number) ? prev : [...prev, existing.value as number]))
      return
    }
    setNewTags((prev) => (prev.some((name) => isSameText(name, label)) ? prev : [...prev, label.trim()]))
  }

  const handleSave = async () => {
    try {
      setError(null)
      const result = await updateTransactionTags({ transactionId, tagIds, newTags }).unwrap()
      onUpdated(result.data.tags)
      setIsEditing(false)
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('transaction.tagsUpdated'), type: 'success' } })) } catch(_) {}
    } catch (err) {
      const serverMessage = (err as { data?: { message?: string } })?.data?.message
      setError(serverMessage || t('common.genericError'))
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-mm-text">
          {t('transaction.tags')}
        </label>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={startEditing} className="!py-1 !px-2.5 text-xs">
            {t('transaction.editTags')}
          </Button>
        )}
      </div>

      {!isEditing && (
        tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/40"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-mm-subtleText">{t('transaction.noTags')}</p>
        )
      )}

      {isEditing && (
        <div className="space-y-3">
          <Select
            id={`transaction-${transactionId}-tags`}
            value={[...tagIds, ...newTags]}
            onChange={(value) => {
              const values = Array.isArray(value) ? value : [value]
              setTagIds(values.filter((v): v is number => typeof v === 'number'))
              setNewTags(values.filter((v): v is string => typeof v === 'string'))
            }}
            options={options}
            placeholder={t('transaction.tagPlaceholder')}
            isMulti
            closeMenuOnSelect={false}
            creatable
            onCreateOption={handleCreate}
            createOptionText={(label) => `${t('common.create')}: "${label}"`}
            usePortal
            error={error || undefined}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionTagEditor
