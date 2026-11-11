import type { AppDispatch } from '@/store/store'
import { authApi } from '@/services/authApi'
import { accountApi } from '@/services/accountApi'
import { contactApi } from '@/services/contactApi'
import { transactionApi } from '@/services/transactionApi'
import { tagApi } from '@/services/tagApi'
import { installmentApi } from '@/services/installmentApi'
import { dashboardApi } from '@/services/dashboardApi'
import { reportApi } from '@/services/reportApi'

/** Drops every cached API response, so the next user on this browser never sees the previous user's data. */
export const resetAllApiState = (dispatch: AppDispatch) => {
  dispatch(authApi.util.resetApiState())
  dispatch(accountApi.util.resetApiState())
  dispatch(contactApi.util.resetApiState())
  dispatch(transactionApi.util.resetApiState())
  dispatch(tagApi.util.resetApiState())
  dispatch(installmentApi.util.resetApiState())
  dispatch(dashboardApi.util.resetApiState())
  dispatch(reportApi.util.resetApiState())
}
