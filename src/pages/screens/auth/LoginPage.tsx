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
    <AuthContainer title="Hoş Geldiniz" subtitle="Hesabınıza giriş yapın">
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
            <PasswordInput
              id="password"
              label="Şifre"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Şifrenizi girin"
              error={passwordError}
            />
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
    </AuthContainer>
  )
}


