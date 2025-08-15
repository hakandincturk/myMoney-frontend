import React, { useState, useEffect } from 'react'
import { useRegisterMutation } from '@/services/authApi'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [register, { isLoading, isSuccess }] = useRegisterMutation()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Başarılı kayıt sonrası login sayfasına yönlendir
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Kayıt başarılı! Lütfen giriş yapın.',
            email: form.email,
          },
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate, form.email])

  // Validasyon fonksiyonları
  const validateFullName = (fullName: string) => {
    if (!fullName.trim()) return 'Ad soyad gereklidir'
    if (fullName.trim().length < 2) return 'Ad soyad en az 2 karakter olmalıdır'
    return ''
  }
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
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return 'Şifre tekrarı gereklidir'
    if (confirmPassword !== password) return 'Şifreler eşleşmiyor'
    return ''
  }
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return 'Telefon numarası gereklidir'
    if (!(/[\+]?\d[\d\s\-\(\)]{9,}$/).test(phone)) return 'Geçerli bir telefon numarası giriniz'
    return ''
  }

  const handleFieldChange = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (isSubmitted) {
      let validationError = ''
      switch (key) {
        case 'fullName':
          validationError = validateFullName(value)
          break
        case 'email':
          validationError = validateEmail(value)
          break
        case 'password':
          validationError = validatePassword(value)
          // Şifre değiştiğinde şifre tekrar hatasını da güncelle
          setFieldErrors(prev => ({
            ...prev,
            password: validationError,
            confirmPassword: validateConfirmPassword(form.confirmPassword, value),
          }))
          return
        case 'confirmPassword':
          validationError = validateConfirmPassword(value, form.password)
          break
        case 'phone':
          validationError = validatePhone(value)
          break
      }
      setFieldErrors(prev => ({ ...prev, [key]: validationError }))
    }
  }
  function update<K extends keyof typeof form>(key: K, value: string) {
    handleFieldChange(key, value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitted(true)
    setError('')
    const fullNameValidation = validateFullName(form.fullName)
    const emailValidation = validateEmail(form.email)
    const passwordValidation = validatePassword(form.password)
    const confirmValidation = validateConfirmPassword(form.confirmPassword, form.password)
    const phoneValidation = validatePhone(form.phone)
    setFieldErrors({
      fullName: fullNameValidation,
      email: emailValidation,
      password: passwordValidation,
      confirmPassword: confirmValidation,
      phone: phoneValidation,
    })
    if (fullNameValidation || emailValidation || passwordValidation || confirmValidation || phoneValidation) {
      return
    }
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      }).unwrap()
    } catch {
      setError('Kayıt işlemi başarısız. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-mm-secondary/30 via-mm-primary/30 to-mm-accent/30 flex items-center justify-center mb-4 border border-mm-border backdrop-blur">
            <svg className="h-8 w-8 text-mm-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-mm-text mb-2">Hesap Oluştur</h2>
          <p className="text-slate-500 dark:text-mm-subtleText">Kişisel finans yönetiminizi başlatın</p>
        </div>
        <Card className="shadow-2xl shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="fullName"
              label="Ad Soyad"
              type="text"
              placeholder="Adınız ve soyadınız"
              value={form.fullName}
              onChange={v => update('fullName', v)}
              error={fieldErrors.fullName}
            />
            <Input
              id="email"
              label="E-posta Adresi"
              type="text"
              placeholder="ornek@email.com"
              value={form.email}
              onChange={v => update('email', v)}
              error={fieldErrors.email}
            />
            <div>
              <Input
                id="password"
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="En az 6 karakter"
                value={form.password}
                onChange={v => update('password', v)}
                error={fieldErrors.password}
              />
              <button
                type="button"
                className="-mt-10 mr-3 float-right text-mm-placeholder hover:text-mm-text"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Gizle' : 'Göster'}
              </button>
            </div>
            <Input
              id="confirmPassword"
              label="Şifre (Tekrar)"
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifrenizi tekrar girin"
              value={form.confirmPassword}
              onChange={v => update('confirmPassword', v)}
              error={fieldErrors.confirmPassword}
            />
            <Input
              id="phone"
              label="Telefon Numarası"
              type="text"
              placeholder="+90 5XX XXX XX XX"
              value={form.phone}
              onChange={v => update('phone', v)}
              error={fieldErrors.phone}
            />
            {error && (
              <div className="bg-mm-surface border border-red-500/30 rounded-xl p-3 text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="shadow-md shadow-mm-accent/20">
              {isLoading ? 'Kayıt oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
            {isSuccess && (
              <div className="bg-mm-surface border border-mm-border rounded-xl p-3 text-mm-secondary">
                Kayıt başarılı! Giriş yapabilirsiniz.
              </div>
            )}
            <div className="text-center text-sm text-mm-subtleText">
              Zaten hesabınız var mı?{' '}
              <Link to="/login" className="text-mm-primary hover:text-mm-primaryHover">
                Giriş yapın
              </Link>
            </div>
          </form>
        </Card>
      </div>
  )
}


