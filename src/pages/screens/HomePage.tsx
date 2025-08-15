import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAuth } from '@/store/slices/authSelectors'
import { authSlice } from '@/store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

export const HomePage: React.FC = () => {
  const auth = useAppSelector(selectAuth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(authSlice.actions.logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MyMoney</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Ana İçerik */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoş Geldiniz!</h2>
          <p className="text-lg text-gray-600">
            Kişisel finans yönetiminizi kolaylaştırın, hedeflerinize ulaşın.
          </p>
        </div>

        {/* Dashboard Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Toplam Bakiye</h3>
            <p className="text-2xl font-bold text-green-600">₺0.00</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay Gelir</h3>
            <p className="text-2xl font-bold text-blue-600">₺0.00</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bu Ay Gider</h3>
            <p className="text-2xl font-bold text-red-600">₺0.00</p>
          </div>
        </div>
      </main>
    </div>
  )
}


