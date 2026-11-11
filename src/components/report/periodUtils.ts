import { PeriodKind } from '@/enums'

export type Period = {
  year: number
  month: number // 1-12
}

// Matches the backend `label` field and the i18n months.* keys.
export const MONTH_LABELS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const

export const labelOfMonth = (month: number): string => MONTH_LABELS[month - 1] ?? MONTH_LABELS[0]

export const addMonths = ({ year, month }: Period, delta: number): Period => {
  const zeroBased = year * 12 + (month - 1) + delta
  return {
    year: Math.floor(zeroBased / 12),
    month: (zeroBased % 12) + 1,
  }
}

export const samePeriod = (a: Period, b: Period): boolean => a.year === b.year && a.month === b.month

/** Chronological ordering key, safe for sorting and comparison. */
export const periodIndex = ({ year, month }: Period): number => year * 12 + (month - 1)

export const currentPeriod = (): Period => {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/**
 * Reports default to the last *completed* month: the screen is about settled numbers,
 * while the dashboard already covers the running month.
 */
export const defaultReportPeriod = (): Period => addMonths(currentPeriod(), -1)

/**
 * Client-side kind, used by the period bar before any request resolves. The server is
 * authoritative for loaded data — always prefer the `kind` field when it is available.
 */
export const kindOfPeriod = (period: Period): PeriodKind => {
  const diff = periodIndex(period) - periodIndex(currentPeriod())
  if (diff < 0) return PeriodKind.ACTUAL
  if (diff === 0) return PeriodKind.PARTIAL
  return PeriodKind.PROJECTED
}

/** Builds an inclusive range of periods around a centre, e.g. -6..+6. */
export const periodRange = (centre: Period, past: number, future: number): Period[] => {
  const result: Period[] = []
  for (let offset = -past; offset <= future; offset += 1) {
    result.push(addMonths(centre, offset))
  }
  return result
}
