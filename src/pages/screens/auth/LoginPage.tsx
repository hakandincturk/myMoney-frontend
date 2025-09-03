import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthContainer } from '@/components/ui/AuthContainer'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { useLoginMutation } from '@/services/authApi'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { authSlice } from '@/store/slices/authSlice'

export const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const update = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: String(value) }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!form.email) {
      errors.email = t('validation.required')
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = t('validation.email')
    }

    if (!form.password) {
      errors.password = t('validation.required')
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const result = await login(form).unwrap()
      if (result.type && result.data?.token) {
        dispatch(authSlice.actions.setToken(result.data.token))
        navigate('/')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <AuthContainer title={t('auth.login')} subtitle={t('auth.startFinance')}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t('auth.welcome')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('auth.startFinance')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          id="email"
          label={t('auth.email')}
          type="email"
          placeholder={t('auth.placeholders.email')}
          value={form.email}
          onChange={(v: string | number) => update('email', v)}
          error={fieldErrors.email}
          required
        />

        <PasswordInput
          id="password"
          label={t('auth.password')}
          placeholder={t('auth.placeholders.password')}
          value={form.password}
          onChange={(v: string | number) => update('password', v)}
          error={fieldErrors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? t('auth.loginInProgress') : t('auth.login')}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-slate-600 dark:text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {t('auth.registerHere')}
          </Link>
        </p>
      </div>
    </AuthContainer>
  )
}


