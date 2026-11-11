import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SessionsPanel } from '@/components/account-settings/SessionsPanel'
import { useLogoutMutation } from '@/services/authApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'
import { selectUser } from '@/store/slices/authSelectors'
import { resetAllApiState } from '@/store/resetApiState'

/** "Hesabım": the user's own account. Sessions first; profile/password sections will join later. */
export const AccountSettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const [logoutRequest] = useLogoutMutation()

  const logoutCurrent = async () => {
    try {
      await logoutRequest().unwrap()
    } catch {
      // already ended: leave locally anyway
    }
    dispatch(authSlice.actions.clearAuth())
    resetAllApiState(dispatch)
    navigate('/login')
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 pb-10 pt-6 dark:bg-mm-bg sm:px-6 md:px-8">
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <header>
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            myMoney
          </span>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-mm-text">
            {t('accountSettings.title')}
          </h1>
          {user && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user.fullName} · {user.email}
            </p>
          )}
        </header>

        <SessionsPanel onLogoutCurrent={logoutCurrent} />
      </div>
    </div>
  )
}

export default AccountSettingsPage
