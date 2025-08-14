import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { selectAuth } from '@/store/slices/authSelectors'

type ProtectedRouteProps = {
  children: React.ReactNode
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const auth = useAppSelector(selectAuth)
  const location = useLocation()

  // Eğer authentication gerekiyorsa ve kullanıcı giriş yapmamışsa
  if (requireAuth && !auth.token) {
    // Login sayfasına yönlendir, sonra geri dönmek için state ile
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Eğer authentication gerekmeyen sayfalardaysa (login/register) ve kullanıcı giriş yapmışsa
  if (!requireAuth && auth.token) {
    // Ana sayfaya yönlendir
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
