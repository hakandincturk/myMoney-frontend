import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { authSlice } from '@/store/slices/authSlice'
import { ENV_CONFIG } from '../config/environment'
import { ApiUrl } from '../config/ApiUrl'

// The session travels in an HttpOnly cookie; the browser attaches it, the app never sees it.
const baseQuery = fetchBaseQuery({
  baseUrl: ENV_CONFIG.getApiBaseUrl(),
  credentials: 'include',
})

// Calls whose 401 is an expected answer, not an expired session:
// /auth/me on start means "not logged in", /auth/login means "wrong credentials" (shown on the form).
const QUIET_401_URLS: string[] = [ApiUrl.AUTH_ME.toString(), ApiUrl.AUTH_LOGIN.toString()]

const requestUrl = (args: string | FetchArgs) => (typeof args === 'string' ? args : args.url)

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

    if (status === 401 && QUIET_401_URLS.includes(requestUrl(args))) {
      // Expected 401: the caller handles it (AuthBootstrap / login form)
    } else if (status === 401) {
      // Session ended on the server (expired, revoked from another device, logged out elsewhere)
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

        // No navigation here: clearAuth() makes ProtectedRoute redirect to /login right away.
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
