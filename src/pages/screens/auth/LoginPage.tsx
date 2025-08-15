import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'
import { selectAuth } from '@/store/slices/authSelectors'
import { useLoginMutation } from '@/services/authApi'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
    <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-mm-primary/30 via-mm-secondary/30 to-mm-accent/30 flex items-center justify-center mb-4 border border-mm-border backdrop-blur">
            <svg className="h-8 w-8 text-mm-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-mm-text mb-2">Hoş Geldiniz</h2>
          <p className="text-slate-500 dark:text-mm-subtleText">
						Kişisel finans yönetiminizi kolaylaştırın, hedeflerinize ulaşın
					</p>
        </div>
        <Card className="shadow-2xl shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="E-posta Adresi"
              type="text"
              placeholder="ornek@email.com"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
            />
            <div>
              <Input
                id="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifrenizi girin"
                value={password}
                onChange={handlePasswordChange}
                error={passwordError}
              />
              <button
                type="button"
                className="-mt-10 mr-3 float-right text-mm-placeholder hover:text-mm-text"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
            {successMessage && (
              <div className="bg-mm-surface border border-mm-border rounded-xl p-3 text-mm-secondary">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-mm-surface border border-red-500/30 rounded-xl p-3 text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="shadow-md shadow-mm-accent/20">
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
            <div className="text-center text-sm text-mm-subtleText">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-mm-primary hover:text-mm-primaryHover">
                Kayıt olun
              </Link>
            </div>
          </form>
        </Card>
      </div>
  )
}


