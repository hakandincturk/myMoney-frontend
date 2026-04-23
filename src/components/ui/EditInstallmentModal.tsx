import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { InstallmentDTOs } from '@/types/installment'
import { InstallmentStatus } from '@/enums/installment'
import { useUpdateInstallmentMutation } from '@/services/installmentApi'

type EditInstallmentModalProps = {
  open: boolean
  onClose: () => void
  installment: InstallmentDTOs.ListItem | null
}

export const EditInstallmentModal: React.FC<EditInstallmentModalProps> = ({
  open,
  onClose,
  installment,
}) => {
  const { t } = useTranslation()
  const [updateInstallment, { isLoading }] = useUpdateInstallmentMutation()

  const [amount, setAmount] = useState<string>('')
  const [status, setStatus] = useState<InstallmentStatus>(InstallmentStatus.ACTIVE)

  useEffect(() => {
    if (installment && open) {
      setAmount(
        installment.amount.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      )
      setStatus(installment.status === InstallmentStatus.SKIPPED ? InstallmentStatus.SKIPPED : InstallmentStatus.ACTIVE)
    }
  }, [installment, open])

  const isSkipped = status === InstallmentStatus.SKIPPED
  const isPaid = installment?.paid === true

  const parseAmount = (raw: string): number => {
    const normalized = String(raw).replace(/\./g, '').replace(',', '.')
    return parseFloat(normalized) || 0
  }

  const handleSave = async () => {
    if (!installment) return

    const body: InstallmentDTOs.UpdateRequest = {}

    const parsedAmount = parseAmount(amount)
    if (parsedAmount > 0 && parsedAmount !== installment.amount) {
      body.amount = parsedAmount
    }

    const currentStatus = installment.status || InstallmentStatus.ACTIVE
    if (status !== currentStatus) {
      body.status = status
    }

    if (body.amount === undefined && body.status === undefined) {
      onClose()
      return
    }

    try {
      await updateInstallment({ id: installment.id, ...body }).unwrap()
      try {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: t('installment.updateSuccess'), type: 'success' },
          })
        )
      } catch (_) {}
      onClose()
    } catch (err) {
      const errData = (err as { data?: { message?: string } })?.data
      const message = errData?.message || t('installment.updateFailed')
      try {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message, type: 'error' },
          })
        )
      } catch (_) {}
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('installment.editInstallment')}
      size="sm"
      zIndex={10002}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="!rounded-lg">
            {t('buttons.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading} className="!rounded-lg">
            {t('buttons.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status toggle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-mm-text mb-2">
            {t('installment.status')}
          </label>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStatus(InstallmentStatus.ACTIVE)}
              disabled={isPaid}
              className={`flex-1 !rounded-lg ${
                status === InstallmentStatus.ACTIVE
                  ? '!bg-green-600 !text-white !border-green-600 hover:!bg-green-700 hover:!border-green-700 focus:!ring-green-600/50'
                  : ''
              }`}
            >
              {t('installment.statusActive')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStatus(InstallmentStatus.SKIPPED)}
              disabled={isPaid}
              className={`flex-1 !rounded-lg ${
                status === InstallmentStatus.SKIPPED
                  ? '!bg-amber-500 !text-white !border-amber-500 hover:!bg-amber-600 hover:!border-amber-600 focus:!ring-amber-500/50'
                  : ''
              }`}
            >
              {t('installment.statusSkipped')}
            </Button>
          </div>
          {isPaid && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              {t('installment.cannotSkipPaid')}
            </p>
          )}
        </div>

        {/* Amount input */}
        <div>
          <Input
            id="editInstallmentAmount"
            label={t('installment.amountLabel')}
            value={amount}
            onChange={(v) => setAmount(String(v))}
            formatCurrency
            currencySymbol="₺"
            disabled={isSkipped}
          />
          {isSkipped && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              {t('installment.cannotEditSkipped')}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default EditInstallmentModal
