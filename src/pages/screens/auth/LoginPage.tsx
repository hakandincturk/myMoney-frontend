import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'
import { selectAuth } from '@/store/slices/authSelectors'
import { useLoginMutation } from '@/services/authApi'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useAppSelector(selectAuth)
  const [login, { isLoading }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Giriş yapıldıktan sonra ana sayfaya yönlendir
  useEffect(() => {
    if (auth.token) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [auth.token, navigate, location.state])

  // Kayıt sonrası gelen mesajı al
  const successMessage = (location.state as any)?.message
  const preFilledEmail = (location.state as any)?.email

  // Eğer kayıt sonrası email geldiyse, email alanını doldur
  useEffect(() => {
    if (preFilledEmail) {
      setEmail(preFilledEmail)
    }
  }, [preFilledEmail])

  // Validasyon fonksiyonları
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'E-posta adresi gereklidir'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Geçerli bir e-posta adresi giriniz'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Şifre gereklidir'
    if (password.length < 6) return 'Şifre en az 6 karakter olmalıdır'
    return ''
  }

  // Input değişikliklerinde validasyon
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (isSubmitted) {
      setEmailError(validateEmail(value))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (isSubmitted) {
      setPasswordError(validatePassword(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitted(true)
    setError('')
    
    // Manuel validasyon
    const emailValidation = validateEmail(email)
    const passwordValidation = validatePassword(password)
    
    setEmailError(emailValidation)
    setPasswordError(passwordValidation)
    
    if (emailValidation || passwordValidation) {
      return
    }

    try {
      const result = await login({ email: email.trim(), password }).unwrap()
      dispatch(authSlice.actions.setToken(result.data.token))
      // useEffect ile yönlendirme yapılacak
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol taraf - Mavi gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 items-center justify-center">
        <div className="text-center text-white">
          <div className="mx-auto h-24 w-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-blue-900">MyMoney</h1>
          <p className="text-xl text-blue-800 max-w-md">
            Kişisel finans yönetiminizi kolaylaştırın, hedeflerinize ulaşın
          </p>
        </div>
      </div>

      {/* Sağ taraf - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Logo ve Başlık */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz</h2>
            <p className="text-gray-600">Hesabınıza giriş yapın</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
								<input
                  id="email"
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                    emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-500">{emailError}</p>
              )}
            </div>

              {/* Şifre */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 ${
                      passwordError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={e => handlePasswordChange(e.target.value)}
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                  )}
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Başarı Mesajı */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="ml-3 text-sm text-green-600">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Hata Mesajı */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="ml-3 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </button>

              {/* Başarı Mesajı */}
              {auth.token && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="ml-3 text-sm text-green-600">Giriş başarılı!</p>
                  </div>
                </div>
              )}
            </form>

            {/* Alt Linkler */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu?{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                  Kayıt olun
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


