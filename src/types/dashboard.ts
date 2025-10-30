export namespace DashboardDTOs {
  export type QuickViewIncomeAndExpenseDetailDto = {
    occured: number
    waiting: number
    planning: number
    lastMonthChangeRate: number
  }

  export type QuickViewResponseDto = {
    totalBalance: number
    income: QuickViewIncomeAndExpenseDetailDto
    expense: QuickViewIncomeAndExpenseDetailDto
    savingRate: number
    waitingInstallments: number
  }
}


