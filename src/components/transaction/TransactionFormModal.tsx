import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { FormFieldSkeleton } from '@/components/ui/Skeleton'
import { TransactionType } from '@/services/transactionApi'

export type TransactionFormValues = {
	accountId: number | undefined
	contactId: number | undefined
	type: TransactionType
	totalAmount: string
	totalInstallment?: number
	name: string
	description?: string
	debtDate: string
	equalSharingBetweenInstallments: boolean
	categoryIds: number[]
	newCategories: string[]
}

type Option = { value: number | string; label: string }

type TransactionFormModalProps = {
	open: boolean
	title: string
	submitLabel?: string
	cancelLabel?: string
	size?: 'sm' | 'md' | 'lg' | 'xl'
	zIndex?: number
	form: TransactionFormValues
	errors?: Record<string, string | undefined>
	accounts: Option[]
	contacts: Option[]
	categoryOptions: Option[]
	typeOptions: Option[]
	accountsLoading?: boolean
	contactsLoading?: boolean
	hasMoreAccounts?: boolean
	hasMoreContacts?: boolean
	isLoadingMoreAccounts?: boolean
	isLoadingMoreContacts?: boolean
	loadMoreAccounts?: () => void
	loadMoreContacts?: () => void
	createLoading?: boolean
	onClose: () => void
	onSubmit: (e?: React.FormEvent) => void
	onChange: (updater: (prev: TransactionFormValues) => TransactionFormValues) => void
	onCreateCategory?: (label: string) => void
	onAccountChange?: (value: unknown) => void
	accountSelectRef?: React.RefObject<HTMLDivElement>
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
	open,
	title,
	submitLabel,
	cancelLabel,
	size = 'lg',
	zIndex,
	form,
	errors,
	accounts,
	contacts,
	categoryOptions,
	typeOptions,
	accountsLoading,
	contactsLoading,
	hasMoreAccounts,
	hasMoreContacts,
	isLoadingMoreAccounts,
	isLoadingMoreContacts,
	loadMoreAccounts,
	loadMoreContacts,
	createLoading,
	onClose,
	onSubmit,
	onChange,
	onCreateCategory,
	onAccountChange,
	accountSelectRef,
}) => {
	const { t } = useTranslation()

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			size={size}
			zIndex={zIndex}
			footer={(
				<div className="flex justify-end gap-2">
					<Button onClick={onClose} variant="secondary">
						{cancelLabel || t('buttons.cancel')}
					</Button>
					<Button onClick={onSubmit} disabled={createLoading} variant="primary">
						{createLoading ? t('common.loading') : (submitLabel || t('buttons.save'))}
					</Button>
				</div>
			)}
		>
			<form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
				{accountsLoading || contactsLoading ? (
					<>
						<FormFieldSkeleton />
						<div className="grid grid-cols-2 gap-4">
							<FormFieldSkeleton />
							<FormFieldSkeleton />
						</div>
						<FormFieldSkeleton />
						<FormFieldSkeleton />
						<FormFieldSkeleton />
					</>
				) : (
					<>
						<Select
							id="contactId"
							label={t('table.columns.contact')}
							value={form.contactId ?? ''}
							onChange={(value) => onChange((prev) => ({ ...prev, contactId: value as number }))}
							options={contacts}
							placeholder={t('placeholders.selectContact')}
							onLoadMore={loadMoreContacts}
							hasMore={hasMoreContacts}
							isLoadingMore={isLoadingMoreContacts}
						/>
						<Select
							id="accountId"
							label={t('table.columns.account') + ' *'}
							value={form.accountId ?? ''}
							onChange={(value) => {
								if (onAccountChange) {
									onAccountChange(value)
								} else {
									onChange((prev) => ({ ...prev, accountId: value as number }))
								}
							}}
							options={accounts}
							placeholder={t('placeholders.selectAccount')}
							required
							error={errors?.accountId}
							ref={accountSelectRef}
							onLoadMore={loadMoreAccounts}
							hasMore={hasMoreAccounts}
							isLoadingMore={isLoadingMoreAccounts}
						/>

						<Input
							id="name"
							label={t('transaction.name') + ' *'}
							value={form.name}
							onChange={(value) => onChange((prev) => ({ ...prev, name: value as string }))}
							placeholder={t('placeholders.transactionName') || 'Örn: Elektrik Faturası'}
							required
							error={errors?.name}
						/>
						<div className="grid grid-cols-2 gap-4">
							<Input
								id="totalAmount"
								label={t('transaction.totalAmount') + ' *'}
								value={form.totalAmount}
								onChange={(value) => onChange((prev) => ({ ...prev, totalAmount: value as string }))}
								placeholder="0,00"
								formatCurrency
								currencySymbol="₺"
								required
								error={errors?.totalAmount}
							/>
							<Input
								id="totalInstallment"
								label={t('transaction.totalInstallment')}
							value={form.totalInstallment ?? ''}
								onChange={(value) => onChange((prev) => ({ ...prev, totalInstallment: value as number }))}
								placeholder="1"
								type="number"
								min={1}
								step={1}
								error={errors?.totalInstallment}
							/>
						</div>

						<div className="flex items-start gap-3">
							<label className="inline-flex items-center gap-2 select-none cursor-pointer">
								<input
									id="equalSharingBetweenInstallments"
									type="checkbox"
									checked={!!form.equalSharingBetweenInstallments}
									onChange={(e) => onChange((prev) => ({ ...prev, equalSharingBetweenInstallments: e.target.checked }))}
									className="h-4 w-4 rounded border-slate-300 text-mm-primary focus:ring-mm-primary"
								/>
								<span className="text-base font-medium text-slate-900 dark:text-mm-text">
									{t('transaction.equalSharingBetweenInstallments.label')}
								</span>
							</label>
							<div className="relative">
								<button
									type="button"
									aria-label="Info"
									className="h-5 w-5 rounded-full border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center text-xs"
									onClick={(e) => {
										const target = e.currentTarget.nextElementSibling as HTMLDivElement | null
										if (target) {
											target.classList.toggle('hidden')
										}
									}}
								>
									?
								</button>
								<div className="hidden absolute z-50 mt-2 w-80 p-3 rounded-lg border border-slate-200 dark:border-mm-border bg-white dark:bg-mm-card shadow-xl text-sm text-slate-700 dark:text-mm-text">
									<div className="font-medium mb-1">{t('transaction.equalSharingBetweenInstallments.title')}</div>
									<p className="leading-relaxed">{t('transaction.equalSharingBetweenInstallments.help')}</p>
								</div>
							</div>
						</div>

						<Select
							id="type"
							label={t('table.columns.type')}
							value={form.type}
							onChange={(value) => onChange((prev) => ({ ...prev, type: value as TransactionType }))}
							options={typeOptions}
							placeholder={t('transaction.selectType') || 'İşlem türü seçiniz'}
							required
							error={errors?.type}
						/>

						<Select
							id="categories"
							label={t('transaction.categories')}
							value={[...form.categoryIds, ...form.newCategories]}
							onChange={(value) => {
								const arr = Array.isArray(value) ? value : [value]
								const ids = arr.filter((v) => typeof v === 'number') as number[]
								const news = arr.filter((v) => typeof v === 'string') as string[]
								onChange((prev) => ({ ...prev, categoryIds: ids, newCategories: news }))
							}}
							options={categoryOptions}
							placeholder={t('transaction.categoryPlaceholder')}
							isMulti
							closeMenuOnSelect={false}
							creatable
							onCreateOption={(label) => onCreateCategory?.(label)}
							createOptionText={(lbl) => `${t('common.create')}: "${lbl}"`}
						/>

						<DatePicker
							id="debtDate"
							label={t('transaction.debtDate')}
							value={form.debtDate}
							onChange={(value) => onChange((prev) => ({ ...prev, debtDate: value as string }))}
							required
							error={errors?.debtDate}
						/>

						<Input
							id="description"
							label={t('transaction.description') || 'Açıklama'}
							value={form.description ?? ''}
							onChange={(value) => onChange((prev) => ({ ...prev, description: value as string }))}
							placeholder={t('transaction.descriptionPlaceholder') || 'Açıklama ekleyiniz (opsiyonel)'}
						/>
					</>
				)}
			</form>
		</Modal>
	)
}

export default TransactionFormModal
