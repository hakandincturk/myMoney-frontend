import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { transactionApi } from '@/services/transactionApi'
import { installmentApi } from '@/services/installmentApi'
import { accountApi } from '@/services/accountApi'
import { contactApi } from '@/services/contactApi'
import { tagApi } from '@/services/tagApi'
import { dashboardApi } from '@/services/dashboardApi'
import { reportApi } from '@/services/reportApi'

/**
 * Single place that keeps cached financial data fresh.
 *
 * Every screen shows the same underlying money (transactions, installments, balances, tags), but each
 * RTK Query slice only invalidates its own tags. Without this, adding a transaction refreshed the
 * transaction list while the dashboard, reports, installments and account balances kept showing
 * cached numbers for up to an hour. After any successful write below, every financial cache is
 * marked stale: mounted queries refetch at once, the others refetch the next time they are used.
 */
export const financialCacheListener = createListenerMiddleware()

const financialWrite = isAnyOf(
  transactionApi.endpoints.createTransaction.matchFulfilled,
  transactionApi.endpoints.updateTransaction.matchFulfilled,
  transactionApi.endpoints.deleteTransaction.matchFulfilled,
  installmentApi.endpoints.payInstallments.matchFulfilled,
  installmentApi.endpoints.updateInstallment.matchFulfilled,
  accountApi.endpoints.createAccount.matchFulfilled,
  accountApi.endpoints.updateMyAccount.matchFulfilled,
  accountApi.endpoints.deleteAccount.matchFulfilled,
  contactApi.endpoints.createContact.matchFulfilled,
  contactApi.endpoints.updateMyContact.matchFulfilled,
  contactApi.endpoints.deleteContact.matchFulfilled,
  tagApi.endpoints.deleteMyTag.matchFulfilled,
  tagApi.endpoints.renameMyTag.matchFulfilled,
  tagApi.endpoints.updateTransactionTags.matchFulfilled,
)

financialCacheListener.startListening({
  matcher: financialWrite,
  effect: (_action, { dispatch }) => {
    dispatch(transactionApi.util.invalidateTags(['Transaction']))
    dispatch(installmentApi.util.invalidateTags(['Installment']))
    dispatch(accountApi.util.invalidateTags(['Account']))
    dispatch(tagApi.util.invalidateTags(['Tag', 'TagTransaction']))
    dispatch(dashboardApi.util.invalidateTags(['Dashboard']))
    dispatch(reportApi.util.invalidateTags(['Report']))
  },
})
