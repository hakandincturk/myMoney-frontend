// Shared formatting helpers used across v2 dashboard widgets.

export const formatTRY = (amount: number, options: { signed?: boolean } = {}): string => {
  const sign = options.signed && amount > 0 ? '+' : ''
  const abs = Math.abs(amount)
  return `${sign}${amount < 0 ? '-' : ''}₺${abs.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  })}`
}

export const formatCompactTRY = (amount: number): string => {
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) return `₺${(amount / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `₺${(amount / 1_000).toFixed(1)}K`
  return `₺${amount.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
}

export const formatPercent = (rate: number, fractionDigits = 1): string =>
  `%${rate.toFixed(fractionDigits)}`

export type Locale = 'tr' | 'en'

export const formatShortDate = (dateInput: string, locale: Locale = 'tr'): string => {
  const d = new Date(dateInput)
  return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
  })
}

export const formatDayMonthYear = (dateInput: string, locale: Locale = 'tr'): string => {
  const d = new Date(dateInput)
  return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const daysUntil = (dateInput: string): number => {
  const target = new Date(dateInput)
  const today = new Date()
  target.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - today.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

// Groups an ISO date string into a discriminated bucket used for the activity feed.
export type ActivityBucket = 'today' | 'yesterday' | 'earlier'

export const bucketOfDate = (dateInput: string): ActivityBucket => {
  const diff = daysUntil(dateInput)
  if (diff === 0) return 'today'
  if (diff === -1) return 'yesterday'
  return 'earlier'
}
