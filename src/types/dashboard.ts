export namespace DashboardDTOs {
  export type QuickViewIncomeAndExpenseDetailDto = {
    occured: number
    waiting: number
    lastMonthChangeRate: number
  }

  export type QuickViewResponseDto = {
    totalBalance: number
    income: QuickViewIncomeAndExpenseDetailDto
    expense: QuickViewIncomeAndExpenseDetailDto
    savingRate: number
    waitingInstallments: number
  }

  export type MonthlyTrendData = {
    title: string
    income: number
    expense: number
  }

  export type MonthlyTrend = {
    monthlyTrendData: MonthlyTrendData[]
  }

  export type TagSummaryData = {
    name: string
    amount: number
    percentage: number
  }

  export type TagSummary = {
    tagSummaryDatas: TagSummaryData[]
  }

  export type TagSummaryRequest = {
    startDate: string
    endDate: string
  }

  export type TagSummaryParams = {
    type: 'MONTHLY' | 'YEARLY'
    sumMode: 'DOUBLE_COUNT' | 'DISTRIBUTED'
  }

  export type LastTransactionData = {
    type: 'DEBT' | 'CREDIT' | 'PAYMENT' | 'COLLECTION'
    totalAmount: number
    name: string
    description: string | null
    createdAt: string
  }

  export type LastTransactions = {
    lastTransactionData: LastTransactionData[]
  }

  export type IncomingInstallmentsData = {
    transaction: {
      name: string
      description: string | null
      type: 'DEBT' | 'CREDIT' | 'PAYMENT' | 'COLLECTION'
    }
    amount: number
    debtDate: string
    installmentNumber: number
    totalInstallment: number
  }

  export type IncomingInstallments = {
    incomingInstallmentsDatas: IncomingInstallmentsData[]
  }
}


