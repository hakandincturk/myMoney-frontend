import { PeriodKind, RecurringKind, ReportFlowType, TagSumMode } from '../enums'

// Report DTOs — backend sözleşmesi: docs/pages/Reports.md § 5
export namespace ReportDTOs {
  /** One month of totals. income = realized + pending, net = income - expense. */
  export type PeriodTotals = {
    year: number
    month: number // 1-12
    label: string // "JANUARY".."DECEMBER" -> i18n key months.*
    kind: PeriodKind
    income: number
    expense: number
    net: number // can be negative
    realizedIncome: number // paid
    pendingIncome: number // planned, not paid yet
    realizedExpense: number
    pendingExpense: number
    transactionCount: number
    installmentCount: number
  }

  /**
   * Transition between two adjacent periods. Both deltas are read forward in time:
   * deltaVsPrevious = previous -> current (denominator: previous)
   * deltaVsNext     = current  -> next    (denominator: current)
   */
  export type PeriodDelta = {
    incomeChangeRate: number | null // null when the denominator period is 0 -> render "—"
    expenseChangeRate: number | null
    netChangeAmount: number // signed
  }

  export type BusiestDay = {
    date: string // YYYY-MM-DD
    amount: number
  }

  export type TopTag = {
    tagId: number | null // null => the untagged group won
    name: string // "UNTAGGED" when tagId is null
    amount: number
    share: number // % of the period's total
  }

  export type TagRef = {
    id: number
    name: string
  }

  export type PeriodRef = {
    year: number
    month: number
    label: string
  }

  // --- GET /report/summary ---
  export type SummaryRequest = {
    year: number
    month: number
  }

  export type SummaryResponse = {
    previous: PeriodTotals // never null; zero filled when there is no data
    current: PeriodTotals
    next: PeriodTotals // never null
    deltaVsPrevious: PeriodDelta
    deltaVsNext: PeriodDelta
    savingRate: number // %, can be negative, not clamped by the server
    /**
     * Server-side daily average. Pending backend revision 3 this divides the *whole month*
     * expense by the elapsed days, which is dimensionally wrong for a PARTIAL month.
     * ReportKpiStrip derives its own value from realizedExpense / daysElapsed so the card
     * stays correct on both backend versions.
     */
    averageDailyExpense: number
    daysInMonth: number // 28..31
    daysElapsed: number // PARTIAL -> days so far, otherwise === daysInMonth
    busiestDay: BusiestDay | null // null when the period has no expense
    topTag: TopTag | null // null when the period has no expense
  }

  // --- GET /report/timeline ---
  export type TimelineRequest = {
    year: number
    month: number
    pastMonths?: number // default 6, clamped to 0-24
    futureMonths?: number // default 6, clamped to 0-24
  }

  export type TimelinePoint = PeriodTotals & {
    /** Backward looking: debt actually carried at the end of that month. Flat in the future. */
    cumulativeRemainingDebt: number
    /** Forward looking: unpaid installments due after that month. Monotonically decreasing. */
    projectedRemainingDebt: number
  }

  export type TimelineResponse = {
    points: TimelinePoint[] // always pastMonths + 1 + futureMonths entries, gaps zero filled
  }

  // --- GET /report/tag-breakdown ---
  export type TagBreakdownRequest = {
    year: number
    month: number
    type?: ReportFlowType // default EXPENSE
    sumMode?: TagSumMode // default DISTRIBUTED
    limit?: number // default 10
  }

  export type TagBreakdownItem = {
    tagId: number | null // null => untagged group
    name: string // "UNTAGGED" when tagId is null
    amount: number
    percentage: number
    previousAmount: number // 0 when the tag had no amount last month
    changeRate: number | null // null when previousAmount is 0 -> render "—"
    transactionCount: number
  }

  export type TagBreakdownResponse = {
    items: TagBreakdownItem[] // desc by amount, capped by `limit`
    total: number // NOT affected by `limit`
    previousTotal: number // NOT affected by `limit`
    untaggedAmount: number // NOT affected by `limit`
  }

  // --- GET /report/top-expenses ---
  export type TopExpensesRequest = {
    year: number
    month: number
    type?: ReportFlowType // default EXPENSE
    limit?: number // default 5
  }

  export type TopExpenseItem = {
    transactionId: number
    installmentId: number
    name: string
    description: string | null
    amount: number // the installment's share of THIS month, not the transaction total
    date: string // YYYY-MM-DD
    accountName: string
    contactName: string | null
    tags: TagRef[] // can be empty
    installmentNumber: number
    totalInstallment: number // 1 for single-shot transactions
    paid: boolean
  }

  export type TopExpensesResponse = {
    items: TopExpenseItem[]
    periodTotal: number // month total for the selected flow type
  }

  // --- GET /report/recurring ---
  export type RecurringRequest = {
    lookbackMonths?: number // default 6, clamped to 1-24
    minOccurrence?: number // default 3, clamped to 1-24
    limit?: number // default 10
  }

  export type RecurringMonthAmount = {
    year: number
    month: number
    amount: number
  }

  export type RecurringItem = {
    groupKey: string // "TX:{id}" | "NAME:{normalized}" — used as React key, records have no id
    name: string
    kind: RecurringKind
    /**
     * INSTALLMENT rows qualify via transaction.totalInstallment >= minOccurrence, so
     * occurrenceCount may legitimately be lower than minOccurrence. Do not filter on it.
     */
    occurrenceCount: number
    monthsSpan: number
    averageAmount: number // totalAmount / monthsSpan
    totalAmount: number
    lastAmount: number
    lastDate: string
    nextExpectedDate: string | null // INSTALLMENT: real due date, REPEATED: estimate
    amountByMonth: RecurringMonthAmount[] // every month of the window, gaps filled with 0
    tags: TagRef[]
    active: boolean
  }

  export type RecurringResponse = {
    items: RecurringItem[] // desc by averageAmount, capped by `limit`
    monthlyFixedCost: number // NOT affected by `limit` — sum over all groups
    fixedCostShareOfIncome: number // %, 0 when the current month income is 0
    windowStart: PeriodRef // always present, even when items is empty
    windowEnd: PeriodRef // always the server's current month
  }
}
