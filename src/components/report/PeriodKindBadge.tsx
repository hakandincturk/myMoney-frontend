import React from 'react'
import { useTranslation } from 'react-i18next'
import { PeriodKind } from '@/enums'

type PeriodKindBadgeProps = {
  kind: PeriodKind
  className?: string
}

// Projected periods are flagged by colour AND wording AND a dashed container elsewhere —
// colour alone is never the only signal.
const KIND_CLASSES: Record<PeriodKind, string> = {
  [PeriodKind.ACTUAL]: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700/40',
  [PeriodKind.PARTIAL]: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/15',
  [PeriodKind.PROJECTED]: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15',
}

const KIND_KEYS: Record<PeriodKind, string> = {
  [PeriodKind.ACTUAL]: 'reports.period.actual',
  [PeriodKind.PARTIAL]: 'reports.period.partial',
  [PeriodKind.PROJECTED]: 'reports.period.projected',
}

export const PeriodKindBadge: React.FC<PeriodKindBadgeProps> = ({ kind, className = '' }) => {
  const { t } = useTranslation()

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${KIND_CLASSES[kind]} ${className}`}
    >
      {t(KIND_KEYS[kind])}
    </span>
  )
}

export default PeriodKindBadge
