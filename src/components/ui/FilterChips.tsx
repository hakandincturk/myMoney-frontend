import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TransactionDTOs } from '../../types'

export type MultiKey = 'accountIds' | 'contactIds' | 'types'

// Generic interface for any filter type
interface GenericFilterChipsProps<T> {
	appliedFilters: T
	onRemoveKey: (key: keyof T) => void
	onRemoveItem?: (key: string, value: any) => void
	accountIdToName?: Record<number, string>
	contactIdToName?: Record<number, string>
	getTypeLabel?: (value: any) => string
}

// Transaction-specific props (backward compatibility)
interface FilterChipsProps {
	appliedFilters: TransactionDTOs.TransactionFilterRequest | any
	onRemoveKey: (key: any) => void
	onRemoveItem?: (key: MultiKey | string, value: any) => void
	accountIdToName?: Record<number, string>
	contactIdToName?: Record<number, string>
	getTypeLabel?: (value: any) => string
}

export const FilterChips: React.FC<FilterChipsProps> = ({
	appliedFilters,
	onRemoveKey,
	onRemoveItem = () => {},
	accountIdToName = {},
	contactIdToName = {},
	getTypeLabel,
}) => {
	const { t } = useTranslation()
	const [expanded, setExpanded] = useState<{ accountIds: boolean; contactIds: boolean; types: boolean; isPaid: boolean }>({ accountIds: false, contactIds: false, types: false, isPaid: false })

	const hasApplied = useMemo(() => {
		const hasName = appliedFilters.name && appliedFilters.name.trim() !== ''
		const hasFullName = appliedFilters.fullName && appliedFilters.fullName.trim() !== ''
		const hasNote = appliedFilters.note && appliedFilters.note.trim() !== ''
		const hasAccountIds = appliedFilters.accountIds && appliedFilters.accountIds.length > 0
		const hasContactIds = appliedFilters.contactIds && appliedFilters.contactIds.length > 0
		const hasMinAmount = appliedFilters.minAmount && Number(appliedFilters.minAmount) > 0
		const hasMaxAmount = appliedFilters.maxAmount && Number(appliedFilters.maxAmount) > 0
		const hasMinInstallmentCount = appliedFilters.minInstallmentCount && Number(appliedFilters.minInstallmentCount) > 0
		const hasMaxInstallmentCount = appliedFilters.maxInstallmentCount && Number(appliedFilters.maxInstallmentCount) > 0
		const hasStartDate = appliedFilters.startDate && appliedFilters.startDate.trim() !== ''
		const hasEndDate = appliedFilters.endDate && appliedFilters.endDate.trim() !== ''
		const hasTypes = appliedFilters.types && appliedFilters.types.length > 0
		// InstallmentsPage özel alanları
		const hasTransactionName = appliedFilters.transactionName && appliedFilters.transactionName.trim() !== ''
		const hasDescription = appliedFilters.description && appliedFilters.description.trim() !== ''
		const hasMinTotalAmount = typeof appliedFilters.minTotalAmount === 'number' && appliedFilters.minTotalAmount > 0
		const hasMaxTotalAmount = typeof appliedFilters.maxTotalAmount === 'number' && appliedFilters.maxTotalAmount > 0
		const hasIsPaid = appliedFilters.isPaid && appliedFilters.isPaid.length > 0
		const hasPaidStartDate = appliedFilters.paidStartDate && appliedFilters.paidStartDate.trim() !== ''
		const hasPaidEndDate = appliedFilters.paidEndDate && appliedFilters.paidEndDate.trim() !== ''
		return (
			hasName || hasFullName || hasNote || hasAccountIds || hasContactIds || hasMinAmount || hasMaxAmount ||
			hasMinInstallmentCount || hasMaxInstallmentCount || hasStartDate || hasEndDate || hasTypes ||
			hasTransactionName || hasDescription || hasMinTotalAmount || hasMaxTotalAmount || hasIsPaid || hasPaidStartDate || hasPaidEndDate
		)
	}, [appliedFilters])

	if (!hasApplied) return null

	const getAccountLabel = (id: number) => accountIdToName[id] ?? `#${id}`
	const getContactLabel = (id: number) => (id === 0 ? t('filters.noContact') : (contactIdToName[id] ?? `#${id}`))
	const getTypeText = (v: any) => (getTypeLabel ? getTypeLabel(v) : String(v))

	return (
		<div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
			<div className="flex items-center gap-2 mb-2">
				<svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<h4 className="font-medium text-blue-800 dark:text-blue-300">{t('filters.activeFiltersSummary')}</h4>
			</div>
			<div className="flex flex-wrap gap-2">
				{/* Installments filters: transactionName */}
				{appliedFilters.transactionName && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.transactionName')}: {appliedFilters.transactionName}
						<button type="button" onClick={() => onRemoveKey('transactionName')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Installments filters: description */}
				{appliedFilters.description && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.description')}: {appliedFilters.description}
						<button type="button" onClick={() => onRemoveKey('description')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Installments filters: min/max total amount */}
				{typeof appliedFilters.minTotalAmount === 'number' && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.minTotalAmount')}: ₺{Number(appliedFilters.minTotalAmount).toLocaleString('tr-TR')}
						<button type="button" onClick={() => onRemoveKey('minTotalAmount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{typeof appliedFilters.maxTotalAmount === 'number' && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.maxTotalAmount')}: ₺{Number(appliedFilters.maxTotalAmount).toLocaleString('tr-TR')}
						<button type="button" onClick={() => onRemoveKey('maxTotalAmount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Installments filters: isPaid (multi grouped) */}
				{appliedFilters.isPaid && Array.isArray(appliedFilters.isPaid) && appliedFilters.isPaid.length > 0 && (
					<div className="inline-flex flex-col gap-1">
						<span
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full cursor-pointer hover:bg-blue-200/60 dark:hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
							role="button"
							aria-expanded={expanded.isPaid}
							tabIndex={0}
							onClick={() => setExpanded((g) => ({ ...g, isPaid: !g.isPaid }))}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((g) => ({ ...g, isPaid: !g.isPaid })) } }}
						>
							<span className="text-xs">{expanded.isPaid ? '▾' : '▸'}</span>
							{t('filters.paymentStatus')}: {appliedFilters.isPaid.length} {t('filters.selected')}
							<button type="button" onClick={(e) => { e.stopPropagation(); onRemoveKey('isPaid') }} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
						</span>
						{expanded.isPaid && (
							<div className="mt-1 flex flex-wrap gap-1">
								{appliedFilters.isPaid.map((v: boolean, idx: number) => (
									<span key={`paid-${idx}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100/70 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
										{t(v ? 'status.paid' : 'status.pending')}
										<button type="button" onClick={() => onRemoveItem('isPaid', v)} className="ml-0.5 hover:bg-blue-200/70 dark:hover:bg-blue-700/50 rounded-full w-4 h-4 flex items-center justify-center">×</button>
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Installments filters: paid date range */}
				{appliedFilters.paidStartDate && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.paidStartDate')}: {appliedFilters.paidStartDate}
						<button type="button" onClick={() => onRemoveKey('paidStartDate')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{appliedFilters.paidEndDate && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.paidEndDate')}: {appliedFilters.paidEndDate}
						<button type="button" onClick={() => onRemoveKey('paidEndDate')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{/* Transaction name filter */}
				{appliedFilters.name && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.name')}: {appliedFilters.name}
						<button type="button" onClick={() => onRemoveKey('name')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Contact fullName filter */}
				{appliedFilters.fullName && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.fullName')}: {appliedFilters.fullName}
						<button type="button" onClick={() => onRemoveKey('fullName')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Contact note filter */}
				{appliedFilters.note && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.note')}: {appliedFilters.note}
						<button type="button" onClick={() => onRemoveKey('note')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Account IDs filter */}
				{appliedFilters.accountIds && appliedFilters.accountIds.length > 0 && (
					<div className="inline-flex flex-col gap-1">
						<span
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full cursor-pointer hover:bg-blue-200/60 dark:hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
							role="button"
							aria-expanded={expanded.accountIds}
							tabIndex={0}
							onClick={() => setExpanded((g) => ({ ...g, accountIds: !g.accountIds }))}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((g) => ({ ...g, accountIds: !g.accountIds })) } }}
						>
							<span className="text-xs">{expanded.accountIds ? '▾' : '▸'}</span>
							{t('table.columns.account')}: {appliedFilters.accountIds.length} {t('filters.selected')}
							<button type="button" onClick={(e) => { e.stopPropagation(); onRemoveKey('accountIds') }} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
						</span>
						{expanded.accountIds && (
							<div className="mt-1 flex flex-wrap gap-1">
								{appliedFilters.accountIds.map((id: any) => (
									<span key={`acc-${id}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100/70 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
										{getAccountLabel(id as number)}
										<button type="button" onClick={() => onRemoveItem('accountIds', id)} className="ml-0.5 hover:bg-blue-200/70 dark:hover:bg-blue-700/50 rounded-full w-4 h-4 flex items-center justify-center">×</button>
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Contact IDs filter */}
				{appliedFilters.contactIds && appliedFilters.contactIds.length > 0 && (
					<div className="inline-flex flex-col gap-1">
						<span
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full cursor-pointer hover:bg-blue-200/60 dark:hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
							role="button"
							aria-expanded={expanded.contactIds}
							tabIndex={0}
							onClick={() => setExpanded((g) => ({ ...g, contactIds: !g.contactIds }))}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((g) => ({ ...g, contactIds: !g.contactIds })) } }}
						>
							<span className="text-xs">{expanded.contactIds ? '▾' : '▸'}</span>
							{t('table.columns.contact')}: {appliedFilters.contactIds.length} {t('filters.selected')}
							<button type="button" onClick={(e) => { e.stopPropagation(); onRemoveKey('contactIds') }} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
						</span>
						{expanded.contactIds && (
							<div className="mt-1 flex flex-wrap gap-1">
								{appliedFilters.contactIds.map((id: any) => (
									<span key={`contact-${id}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100/70 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
										{getContactLabel(id as number)}
										<button type="button" onClick={() => onRemoveItem('contactIds', id)} className="ml-0.5 hover:bg-blue-200/70 dark:hover:bg-blue-700/50 rounded-full w-4 h-4 flex items-center justify-center">×</button>
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Types filter */}
				{appliedFilters.types && appliedFilters.types.length > 0 && (
					<div className="inline-flex flex-col gap-1">
						<span
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full cursor-pointer hover:bg-blue-200/60 dark:hover:bg-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
							role="button"
							aria-expanded={expanded.types}
							tabIndex={0}
							onClick={() => setExpanded((g) => ({ ...g, types: !g.types }))}
							onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((g) => ({ ...g, types: !g.types })) } }}
						>
							<span className="text-xs">{expanded.types ? '▾' : '▸'}</span>
							{t('table.columns.type')}: {appliedFilters.types.length} {t('filters.selected')}
							<button type="button" onClick={(e) => { e.stopPropagation(); onRemoveKey('types') }} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
						</span>
						{expanded.types && (
							<div className="mt-1 flex flex-wrap gap-1">
								{appliedFilters.types.map((ty: any) => (
									<span key={`type-${ty}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100/70 dark:bg-blue-800/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
										{getTypeText(ty)}
										<button type="button" onClick={() => onRemoveItem('types', ty)} className="ml-0.5 hover:bg-blue-200/70 dark:hover:bg-blue-700/50 rounded-full w-4 h-4 flex items-center justify-center">×</button>
									</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Amount filters */}
				{typeof appliedFilters.minAmount === 'number' && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.minAmount')}: ₺{Number(appliedFilters.minAmount).toLocaleString('tr-TR')}
						<button type="button" onClick={() => onRemoveKey('minAmount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{typeof appliedFilters.maxAmount === 'number' && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.maxAmount')}: ₺{Number(appliedFilters.maxAmount).toLocaleString('tr-TR')}
						<button type="button" onClick={() => onRemoveKey('maxAmount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Installment filters */}
				{appliedFilters.minInstallmentCount && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.minInstallmentCount')}: {appliedFilters.minInstallmentCount}
						<button type="button" onClick={() => onRemoveKey('minInstallmentCount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{appliedFilters.maxInstallmentCount && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.maxInstallmentCount')}: {appliedFilters.maxInstallmentCount}
						<button type="button" onClick={() => onRemoveKey('maxInstallmentCount')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}

				{/* Date filters */}
				{appliedFilters.startDate && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.startDate')}: {appliedFilters.startDate}
						<button type="button" onClick={() => onRemoveKey('startDate')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
				{appliedFilters.endDate && (
					<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-sm rounded-full">
						{t('filters.endDate')}: {appliedFilters.endDate}
						<button type="button" onClick={() => onRemoveKey('endDate')} className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-700/60 rounded-full w-4 h-4 flex items-center justify-center">×</button>
					</span>
				)}
			</div>
		</div>
	)
}

export default FilterChips