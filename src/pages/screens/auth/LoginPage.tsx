import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'
import { selectAuth } from '@/store/slices/authSelectors'
import { useLoginMutation } from '@/services/authApi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { AuthContainer } from '@/components/ui/AuthContainer'

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
      if (result.type === false) {
        setError(result.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
        return
      }
      dispatch(authSlice.actions.setToken(result.data.token))
      // useEffect ile yönlendirme yapılacak
    } catch (err: any) {
      // API'den gelen hata response'unu kontrol et
      if (err?.status === 400 && err?.data?.data) {
        // Validation hatalarını ilgili field'lara ata
        const validationErrors = err.data.data
        if (validationErrors.email?.[0]) {
          setEmailError(validationErrors.email[0])
        }
        if (validationErrors.password?.[0]) {
          setPasswordError(validationErrors.password[0])
        }
        setError('') // Genel hata mesajını temizle
      } else {
        setError(err?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
      }
    }
  }

  return (
    <AuthContainer title="Hoş Geldiniz" subtitle="Kişisel finans yönetiminizi başlatın">
      <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="E-posta Adresi"
              type="text"
              placeholder="ornek@email.com"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              required
            />
            <PasswordInput
              id="password"
              label="Şifre"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Şifrenizi girin"
              error={passwordError}
              required
            />
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl p-3 text-green-700 dark:text-green-400">
                {successMessage}
              </div>
            )}
            {error && (
              <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3 text-red-700 dark:text-red-400 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : 'Giriş Yap'}
            </Button>
            <div className="text-center text-sm text-mm-subtleText">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-mm-primary hover:text-mm-primaryHover">
                Kayıt olun
              </Link>
            </div>
      </form>
    </AuthContainer>
  )
}


