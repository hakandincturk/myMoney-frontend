import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import TransactionFormModal from '@/components/transaction/TransactionFormModal'
import { AccountType, CurrencyType } from '@/services/accountApi'
import type { UseQuickTransactionActions } from './useQuickTransactionActions'

type QuickTransactionModalsProps = {
  controller: UseQuickTransactionActions
}

// Renders the set of modals (transaction / contact / account) driven by a shared controller.
// Mounted at a high level (CommandBar) so quick actions can fire from anywhere.
export const QuickTransactionModals: React.FC<QuickTransactionModalsProps> = ({ controller }) => {
  const { t } = useTranslation()
  const {
    activeModal,
    closeModal,
    transactionForm,
    setTransactionForm,
    transactionErrors,
    variantTypeOptions,
    accounts,
    contacts,
    categoryOptions,
    accountsLoading,
    contactsLoading,
    createLoading,
    handleAccountChange,
    handleTransactionSubmit,
    handleCreateCategory,
    contactForm,
    setContactForm,
    handleContactSubmit,
    accountForm,
    setAccountForm,
    handleAccountSubmit,
  } = controller

  const transactionTitle =
    activeModal === 'income'
      ? t('dashboard.quickActions.income')
      : activeModal === 'expense'
      ? t('dashboard.quickActions.expense')
      : t('dashboard.quickActions.installment')

  return (
    <>
      <TransactionFormModal
        open={activeModal === 'income' || activeModal === 'expense' || activeModal === 'installment'}
        onClose={closeModal}
        title={transactionTitle}
        size="lg"
        form={transactionForm}
        errors={transactionErrors}
        accounts={accounts.map((a) => ({ value: a.id, label: a.name }))}
        contacts={contacts.map((c) => ({ value: c.id, label: c.fullName }))}
        categoryOptions={categoryOptions}
        typeOptions={variantTypeOptions}
        accountsLoading={accountsLoading}
        contactsLoading={contactsLoading}
        createLoading={createLoading}
        onSubmit={handleTransactionSubmit}
        onChange={(updater) => setTransactionForm((prev) => updater(prev))}
        onAccountChange={handleAccountChange}
        onCreateCategory={handleCreateCategory}
      />

      <Modal
        open={activeModal === 'contact'}
        onClose={closeModal}
        title={t('dashboard.v2.modals.contactTitle')}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={closeModal} variant="secondary">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleContactSubmit} variant="primary">
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            id="contactFullName"
            label={`${t('dashboard.v2.modals.contactFullNameLabel')} *`}
            value={contactForm.fullName}
            onChange={(value) => setContactForm((p) => ({ ...p, fullName: value as string }))}
            placeholder={t('placeholders.fullName')}
            required
          />
          <Input
            id="contactNote"
            label={t('dashboard.v2.modals.contactNoteLabel')}
            value={contactForm.note}
            onChange={(value) => setContactForm((p) => ({ ...p, note: value as string }))}
            placeholder={t('dashboard.v2.modals.contactNotePlaceholder')}
          />
        </div>
      </Modal>

      <Modal
        open={activeModal === 'account'}
        onClose={closeModal}
        title={t('dashboard.v2.modals.accountTitle')}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={closeModal} variant="secondary">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAccountSubmit} variant="primary">
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          <Input
            id="accountName"
            label={`${t('dashboard.v2.modals.accountNameLabel')} *`}
            value={accountForm.name}
            onChange={(value) => setAccountForm((p) => ({ ...p, name: value as string }))}
            placeholder={t('dashboard.v2.modals.accountNamePlaceholder')}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="accountType"
              label={t('dashboard.v2.modals.accountTypeLabel')}
              value={accountForm.type}
              onChange={(value) => setAccountForm((p) => ({ ...p, type: value as AccountType }))}
              options={[
                { value: AccountType.CASH, label: t('account.types.cash') },
                { value: AccountType.BANK, label: t('account.types.bank') },
                { value: AccountType.CREDIT_CARD, label: t('account.types.creditCard') },
              ]}
              placeholder={t('placeholders.selectType')}
              required
            />
            <Select
              id="accountCurrency"
              label={t('dashboard.v2.modals.accountCurrencyLabel')}
              value={accountForm.currency}
              onChange={(value) => setAccountForm((p) => ({ ...p, currency: value as CurrencyType }))}
              options={[
                { value: CurrencyType.TL, label: 'TL' },
                { value: CurrencyType.USD, label: 'USD' },
                { value: CurrencyType.EUR, label: 'EUR' },
              ]}
              placeholder={t('placeholders.selectType')}
              required
            />
          </div>
          <Input
            id="accountBalance"
            label={t('dashboard.v2.modals.accountBalanceLabel')}
            value={accountForm.balance}
            onChange={(value) => setAccountForm((p) => ({ ...p, balance: value as string }))}
            placeholder="0,00"
            formatCurrency
            currencySymbol="₺"
          />
        </div>
      </Modal>
    </>
  )
}

export default QuickTransactionModals
