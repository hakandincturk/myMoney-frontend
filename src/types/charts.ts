// Chart tiplerinde kullanılacak type tanımları
export interface ChartDataPoint {
  title: string
  income: number
  expense: number
}

export interface TagData {
  name: string
  amount: number
  percentage: number
  color: string
}

export interface ChartTheme {
  isDark: boolean
  colors: {
    text: string
    grid: string
    background: string
    border: string
  }
}

export interface ChartConfig {
  responsive: boolean
  maintainAspectRatio: boolean
  plugins: any
  scales?: any
  elements?: any
  interaction?: any
  animation?: any
  transitions?: any
  onHover?: any
  cutout?: string
}

export type PeriodType = 'MONTHLY' | 'YEARLY'
export type SumModeType = 'DOUBLE_COUNT' | 'DISTRIBUTED'

export interface ChartControlsState {
  tagPeriod: PeriodType
  tagSumMode: SumModeType
}

export interface DateRange {
  startDate: string
  endDate: string
}