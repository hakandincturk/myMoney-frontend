import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { HomePage } from '@/pages/screens/HomePage'
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


