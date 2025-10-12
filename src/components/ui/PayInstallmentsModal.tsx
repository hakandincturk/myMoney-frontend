import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { usePayInstallmentsMutation } from '@/services/installmentApi'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  onClose: () => void
  ids: number[]
  initialDate?: string
  title?: string
  onSuccess?: () => void
  selectedTotal?: number
}

const PayInstallmentsModal: React.FC<Props> = ({ open, onClose, ids, initialDate, title, onSuccess, selectedTotal }) => {
  const { t } = useTranslation()
  const [paymentDate, setPaymentDate] = useState<string>(initialDate || '')
  const [payInstallments, { isLoading }] = usePayInstallmentsMutation()

  useEffect(() => {
    if (initialDate) setPaymentDate(initialDate)
    else {
      const now = new Date()
      const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
      setPaymentDate(today)
    }
  }, [initialDate, open])

  const handleSave = async () => {
    if (!paymentDate) return
    if (!ids || ids.length === 0) return

    try {
      await payInstallments({ data: { ids, paidDate: paymentDate } }).unwrap()
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('installment.paymentSuccess'), type: 'success' } })) } catch (_) {}
      onSuccess && onSuccess()
      onClose()
    } catch (error) {
      try { window.dispatchEvent(new CustomEvent('showToast', { detail: { message: t('messages.operationFailed'), type: 'error' } })) } catch (_) {}
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t('modals.payInstallment')}
      size="sm"
      zIndex={10001}
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t('buttons.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isLoading}>
            {t('buttons.save')}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {ids.length > 1 && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50/30 dark:bg-yellow-800/20 px-3 py-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-600 dark:text-yellow-300" aria-hidden>
                  <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-100">{t('bulkPay.warning')}</p>
              </div>
            </div>
          </div>
        )}

  {ids.length > 0 && typeof selectedTotal === 'number' ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 dark:text-mm-text">{t('bulkPay.selectedTotal')}</span>
              <span className="text-lg font-bold text-slate-700 dark:text-white">₺{selectedTotal.toLocaleString('tr-TR')}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-mm-subtleText">{t('installment.selectPaymentDate')}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-mm-subtleText">{t('installment.selectPaymentDate')}</p>
        )}

        <DatePicker
          id="paymentDate"
          value={paymentDate}
          onChange={setPaymentDate}
          label={t('installment.paymentDate')}
          required
          usePortal
          dropdownZIndex={10050}
        />
      </div>
    </Modal>
  )
}

export default PayInstallmentsModal
