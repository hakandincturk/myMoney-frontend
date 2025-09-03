import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'
import { authSlice } from '@/store/slices/authSlice'
import { ENV_CONFIG } from '../config/environment'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Navigate event'i sadece bir kez gönder
let navigateEventSent = false

// 500 hataları için toast gösterme helper fonksiyonu
const showServerErrorToast = (errorData: any) => {
  if (typeof window === 'undefined') return

  // Ana hata mesajı
  const mainMessage = errorData?.message || 'Sunucu hatası oluştu'
  
  // Development modunda detay bilgilerini ekle
  let fullMessage = mainMessage
  if (ENV_CONFIG.isDevelopment() && errorData?.data) {
    const debugInfo = typeof errorData.data === 'object' 
      ? JSON.stringify(errorData.data, null, 2)
      : String(errorData.data)
    fullMessage = `${mainMessage}\n\nDEBUG INFO:\n${debugInfo}`
  }

  // Toast event'ini gönder
  const event = new CustomEvent('showToast', {
    detail: {
      message: fullMessage,
      type: 'error',
      duration: ENV_CONFIG.isDevelopment() ? 10000 : 5000 // Dev modunda daha uzun süre göster
    }
  })
  window.dispatchEvent(event)
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error) {
    const status = result.error.status
    const errorData = result.error.data as any

    if (status === 401) {
      // Token'ı temizle
      api.dispatch(authSlice.actions.clearAuth())

      if (typeof window !== 'undefined') {
        const errorMessage = errorData?.message || 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
        
        // Toast event'ini gönder
        const event = new CustomEvent('showToast', {
          detail: {
            message: errorMessage,
            type: 'error',
            duration: 5000
          }
        })
        window.dispatchEvent(event)

        // Navigate event'ini sadece bir kez gönder
        if (!navigateEventSent) {
          navigateEventSent = true
          
          setTimeout(() => {
            const navigateEvent = new CustomEvent('navigateToLogin')
            window.dispatchEvent(navigateEvent)
          }, 5000)
        }
      }
    } else if (status === 500) {
      // 500 Internal Server Error için özel toast göster
      showServerErrorToast(errorData)
      
      // Development modunda console'a da log at
      if (ENV_CONFIG.isDevelopment()) {
        console.error('🚨 Server Error (500):', {
          url: typeof args === 'string' ? args : args.url,
          method: typeof args === 'object' ? args.method : 'GET',
          errorData,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
  
  return result
}
