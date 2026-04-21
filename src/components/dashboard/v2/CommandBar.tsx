import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faCalendarDays,
  faLandmark,
  faUserPlus,
  faChartPie,
} from '@fortawesome/free-solid-svg-icons'
import type { QuickActionKind } from './useQuickTransactionActions'

type CommandAction = {
  kind: QuickActionKind
  label: string
  icon: typeof faArrowTrendUp
  tone: 'income' | 'expense' | 'blue' | 'indigo' | 'amber' | 'purple'
}

type CommandBarProps = {
  onAction: (kind: QuickActionKind) => void
}

const toneStyles: Record<CommandAction['tone'], string> = {
  income:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/20',
  expense:
    'bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/20',
  blue:
    'bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30 dark:hover:bg-blue-500/20',
  indigo:
    'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/20',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-500/20',
  purple:
    'bg-purple-50 text-purple-700 ring-purple-200 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-300 dark:ring-purple-500/30 dark:hover:bg-purple-500/20',
}

// Slim, pill-shaped action strip shown under the hero card. Modal actions delegate to the
// shared quick-transaction controller; "reports" falls through to a route navigation.
export const CommandBar: React.FC<CommandBarProps> = ({ onAction }) => {
  const { t } = useTranslation()

  const actions: CommandAction[] = [
    { kind: 'income', label: t('dashboard.v2.command.addIncome'), icon: faArrowTrendUp, tone: 'income' },
    { kind: 'expense', label: t('dashboard.v2.command.addExpense'), icon: faArrowTrendDown, tone: 'expense' },
    { kind: 'installment', label: t('dashboard.v2.command.addInstallment'), icon: faCalendarDays, tone: 'blue' },
    { kind: 'account', label: t('dashboard.v2.command.addAccount'), icon: faLandmark, tone: 'indigo' },
    { kind: 'contact', label: t('dashboard.v2.command.addContact'), icon: faUserPlus, tone: 'amber' },
    { kind: 'reports', label: t('dashboard.v2.command.reports'), icon: faChartPie, tone: 'purple' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-mm-text">
            {t('dashboard.v2.command.title')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboard.v2.command.subtitle')}
          </p>
        </div>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="toolbar"
        aria-label={t('dashboard.v2.command.title')}
      >
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            onClick={() => onAction(action.kind)}
            className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-mm-card ${toneStyles[action.tone]}`}
          >
            <FontAwesomeIcon icon={action.icon} className="text-sm" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CommandBar
