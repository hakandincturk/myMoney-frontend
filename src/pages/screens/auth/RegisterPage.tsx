import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterMutation } from '@/services/authApi'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { AuthContainer } from '@/components/ui/AuthContainer'

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
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

  // Telefon numarası formatlama fonksiyonu
  const formatPhoneNumber = (value: string) => {
    // Eğer değer zaten +90 ile başlıyorsa, sadece rakamları al
    let numbers = value
    if (value.startsWith('+90')) {
      numbers = value.substring(4) // +90'ı kaldır
    }
    
    // Sadece rakamları al
    numbers = numbers.replace(/\D/g, '')
    
    // Maksimum 10 rakam al
    const limitedNumbers = numbers.slice(0, 10)
    
    // Format: 5XX XXX XX XX
    let formatted = ''
    
    if (limitedNumbers.length >= 1) {
      formatted = limitedNumbers.slice(0, 3)
    }
    if (limitedNumbers.length >= 4) {
      formatted += ' ' + limitedNumbers.slice(3, 6)
    }
    if (limitedNumbers.length >= 7) {
      formatted += ' ' + limitedNumbers.slice(6, 8)
    }
    if (limitedNumbers.length >= 9) {
      formatted += ' ' + limitedNumbers.slice(8, 10)
    }
    
    return formatted
  }

  // Telefon numarası değişikliği için özel handler
  const handlePhoneChange = (value: string) => {
    // Eğer değer +90 ile başlıyorsa, sadece formatla
    if (value.startsWith('+90')) {
      const formatted = formatPhoneNumber(value)
      const finalValue = formatted ? `+90 ${formatted}` : '+90 '
      setForm(prev => ({ ...prev, phone: finalValue }))
    } else {
      // Eğer +90 yoksa, ekle ve formatla
      const formatted = formatPhoneNumber(value)
      const finalValue = formatted ? `+90 ${formatted}` : '+90 '
      setForm(prev => ({ ...prev, phone: finalValue }))
    }
    
    if (isSubmitted) {
      const currentPhone = form.phone
      const validationError = validatePhone(currentPhone)
      setFieldErrors(prev => ({ ...prev, phone: validationError }))
    }
  }

  // Başarılı kayıt sonrası login sayfasına yönlendir
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/login', {
          state: {
            message: t('messages.createSuccess'),
            email: form.email,
          },
        })
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, navigate, form.email, t])

  // Validasyon fonksiyonları
  const validateFullName = (fullName: string) => {
    if (!fullName.trim()) return t('validation.required')
    if (fullName.trim().length < 2) return t('validation.minLength', { min: 2 })
    return ''
  }
  const validateEmail = (email: string) => {
    if (!email.trim()) return t('validation.required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('validation.email')
    return ''
  }
  const validatePassword = (password: string) => {
    if (!password) return t('validation.required')
    if (password.length < 6) return t('validation.minLength', { min: 6 })
    return ''
  }
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return t('validation.required')
    if (confirmPassword !== password) return t('validation.passwordMismatch')
    return ''
  }
  const validatePhone = (phone: string) => {
    if (!phone.trim()) return t('validation.required')
    if (!(/[\+]?\d[\d\s\-\(\)]{9,}$/).test(phone)) return t('validation.invalidPhone')
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
      const result = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      }).unwrap()
      if (result.type === false) {
        setError(result.message || t('messages.operationFailed'))
        return
      }
    } catch (err: any) {
      // API'den gelen hata response'unu kontrol et
      if (err?.status === 400 && err?.data?.data) {
        // Validation hatalarını ilgili field'lara ata
        const validationErrors = err.data.data
        setFieldErrors({
          fullName: validationErrors.fullName?.[0] || '',
          email: validationErrors.email?.[0] || '',
          password: validationErrors.password?.[0] || '',
          confirmPassword: validationErrors.password?.[0] || '',
          phone: validationErrors.phone?.[0] || '',
        })
        setError('') // Genel hata mesajını temizle
      } else {
        setError(err?.data?.message || t('messages.operationFailed'))
      }
    }
  }

  return (
    <AuthContainer title={t('auth.register')} subtitle={t('auth.startFinance')}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              id="fullName"
              label={t('auth.fullName')}
              type="text"
              placeholder={t('auth.placeholders.fullName')}
              value={form.fullName}
              onChange={v => update('fullName', v as string)}
              error={fieldErrors.fullName}
              required
            />
            <Input
              id="email"
              label={t('auth.email')}
              type="text"
              placeholder={t('auth.placeholders.email')}
              value={form.email}
              onChange={v => update('email', v as string)}
              error={fieldErrors.email}
              required
            />
            <PasswordInput
              id="password"
              label={t('auth.password')}
              value={form.password}
              onChange={v => update('password', v as string)}
              placeholder={t('validation.minLength', { min: 6 })}
              error={fieldErrors.password}
              required
            />
            <PasswordInput
              id="confirmPassword"
              label={t('auth.confirmPassword')}
              value={form.confirmPassword}
              onChange={v => update('confirmPassword', v as string)}
              placeholder={t('auth.confirmPassword')}
              error={fieldErrors.confirmPassword}
              required
            />
            <Input
              id="phone"
              label={t('auth.phone')}
              type="text"
              placeholder="+90 5XX XXX XX XX"
              value={form.phone}
              onChange={v => handlePhoneChange(v as string)}
              error={fieldErrors.phone}
              required
            />
            {error && (
              <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl p-3 text-red-700 dark:text-red-400 transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.registerInProgress')}</span>
                </div>
              ) : t('auth.register')}
            </Button>
            {isSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-xl p-3 text-green-700 dark:text-green-400">
                {t('messages.createSuccess')}
              </div>
            )}
            <div className="text-center text-sm text-mm-subtleText">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-mm-primary hover:text-mm-primaryHover">
                {t('auth.loginHere')}
              </Link>
            </div>
      </form>
    </AuthContainer>
  )
}


