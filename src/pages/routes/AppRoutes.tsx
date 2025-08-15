import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/screens/HomePage'
import { ContactsPage } from '../screens/ContactsPage'
import { AccountsPage } from '../screens/AccountsPage'
import { DebtsOverviewPage } from '../screens/DebtsOverviewPage'
import { InstallmentsPage } from '../screens/InstallmentsPage'
import { LoginPage } from '@/pages/screens/auth/LoginPage'
import { RegisterPage } from '@/pages/screens/auth/RegisterPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Ana sayfa - authentication gerekli */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute requireAuth={true}>
            <HomePage />
          </ProtectedRoute>
        } 
      />

      {/* Kişiler */}
      <Route
        path="/contacts"
        element={
          <ProtectedRoute requireAuth={true}>
            <ContactsPage />
          </ProtectedRoute>
        }
      />

      {/* Hesaplar */}
      <Route
        path="/accounts"
        element={
          <ProtectedRoute requireAuth={true}>
            <AccountsPage />
          </ProtectedRoute>
        }
      />

      {/* Borçlar Genel Bakış */}
      <Route
        path="/debts/overview"
        element={
          <ProtectedRoute requireAuth={true}>
            <DebtsOverviewPage />
          </ProtectedRoute>
        }
      />

      {/* Taksitler */}
      <Route
        path="/installments"
        element={
          <ProtectedRoute requireAuth={true}>
            <InstallmentsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Login sayfası - authentication gerekmez, giriş yapmışsa ana sayfaya yönlendir */}
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <LoginPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Register sayfası - authentication gerekmez, giriş yapmışsa ana sayfaya yönlendir */}
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <RegisterPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Varsayılan yönlendirme - login sayfasına */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}


