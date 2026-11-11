import React, { useEffect } from 'react'
import { useMeQuery } from '@/services/authApi'
import { useAppDispatch } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'

const RETRY_MS = 3000

/**
 * Asks the backend once on start whether the session cookie is still valid.
 * Until it answers, auth status stays 'unknown' and ProtectedRoute shows a loader.
 * Only a 401 means "not logged in"; a network error or 5xx (e.g. backend restarting)
 * is retried, so a valid session is not thrown away because the server was briefly down.
 */
export const AuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch()
  const { data, error, isError, isSuccess, refetch } = useMeQuery()

  useEffect(() => {
    if (isSuccess && data?.type && data.data) {
      dispatch(authSlice.actions.setUser(data.data))
      return
    }
    if (isSuccess && !data?.type) {
      dispatch(authSlice.actions.setAnonymous())
      return
    }
    if (isError) {
      const status = (error as { status?: number | string } | undefined)?.status
      if (status === 401) {
        dispatch(authSlice.actions.setAnonymous())
        return
      }
      const timer = window.setTimeout(() => refetch(), RETRY_MS)
      return () => window.clearTimeout(timer)
    }
  }, [data, error, isError, isSuccess, refetch, dispatch])

  return <>{children}</>
}
