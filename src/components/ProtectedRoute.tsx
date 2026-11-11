import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectAuthStatus } from '@/store/slices/authSelectors'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const status = useAppSelector(selectAuthStatus)
  const location = useLocation()

  // Session check still running (GET /auth/me): do not redirect yet
  if (status === 'unknown') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      </div>
    )
  }

  if (requireAuth && status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!requireAuth && status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
