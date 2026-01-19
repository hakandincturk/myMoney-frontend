import React, { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
const HomePage = lazy(() => import('@/pages/screens/HomePage'))
const ContactsPage = lazy(() => import('../screens/ContactsPage'))
const AccountsPage = lazy(() => import('../screens/AccountsPage'))
const CategoriesPage = lazy(() => import('../screens/CategoriesPage'))
const DebtsOverviewPage = lazy(() => import('../screens/DebtsOverviewPage'))
const InstallmentsPage = lazy(() => import('../screens/InstallmentsPage'))
const LoginPage = lazy(() => import('@/pages/screens/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/screens/auth/RegisterPage'))
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ana sayfa - authentication gerekli */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <HomePage />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      {/* Kişiler */}
      <Route
        path="/contacts"
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <ContactsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Hesaplar */}
      <Route
        path="/accounts"
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <AccountsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Kategoriler */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <CategoriesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Borçlar Genel Bakış */}
      <Route
        path="/debts/overview"
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <DebtsOverviewPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Taksitler */}
      <Route
        path="/installments"
        element={
          <ProtectedRoute requireAuth={true}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <InstallmentsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      
      {/* Login sayfası - authentication gerekmez, giriş yapmışsa ana sayfaya yönlendir */}
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <LoginPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Register sayfası - authentication gerekmez, giriş yapmışsa ana sayfaya yönlendir */}
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Suspense fallback={<div>Yükleniyor…</div>}>
              <RegisterPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Varsayılan yönlendirme - login sayfasına */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}


