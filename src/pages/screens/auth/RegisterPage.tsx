import React, { useState, useEffect } from 'react'
import { useRegisterMutation } from '@/services/authApi'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { AuthContainer } from '@/components/ui/AuthContainer'

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
    <AuthContainer title="Hesap Oluştur" subtitle="Kişisel finans yönetiminizi başlatın">
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
            <PasswordInput
              id="password"
              label="Şifre"
              value={form.password}
              onChange={v => update('password', v)}
              placeholder="En az 6 karakter"
              error={fieldErrors.password}
            />
            <Input
              id="confirmPassword"
              label="Şifre (Tekrar)"
              type="password"
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
    </AuthContainer>
  )
}


