import React from 'react'
import { formatPercent, formatTRY } from '@/utils/formatters'

/**
 * Which metric the delta belongs to. This decides the colour, NOT the arrow direction:
 * a falling expense is good (green) while a falling income is bad (red).
 */
export type DeltaMetric = 'income' | 'expense' | 'net'

type DeltaBadgeProps = {
  /** Change rate in percent, or an absolute TRY amount when format is 'currency'. */
  value: number | null
  metric: DeltaMetric
  format?: 'percent' | 'currency'
  className?: string
  title?: string
}

type Tone = 'good' | 'bad' | 'flat'

// An increase is good for income and net, bad for expense. Zero is always neutral.
const toneOf = (value: number, metric: DeltaMetric): Tone => {
  if (value === 0) return 'flat'
  const increaseIsGood = metric !== 'expense'
  const isIncrease = value > 0
  return isIncrease === increaseIsGood ? 'good' : 'bad'
}

const TONE_CLASSES: Record<Tone, string> = {
  good: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15',
  bad: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/15',
  flat: 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700/40',
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({
  value,
  metric,
  format = 'percent',
  className = '',
  title,
}) => {
  // The server sends null when the reference period was zero — never coerce it to 0.
  if (value === null || value === undefined || Number.isNaN(value)) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-semibold tabular-nums ${TONE_CLASSES.flat} ${className}`}
        title={title}
      >
        —
      </span>
    )
  }

  const tone = toneOf(value, metric)
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : ''
  const magnitude =
    format === 'currency' ? formatTRY(Math.abs(value)) : formatPercent(Math.abs(value))

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold tabular-nums ${TONE_CLASSES[tone]} ${className}`}
      title={title}
    >
      {arrow && <span className="text-[9px] leading-none">{arrow}</span>}
      {magnitude}
    </span>
  )
}

export default DeltaBadge
