import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'
import { authSlice } from '@/store/slices/authSlice'

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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Token'ı temizle
    api.dispatch(authSlice.actions.clearAuth())

    if (typeof window !== 'undefined') {
      const errorMessage = (result.error.data as any)?.message || 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
      
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
  }
  
  return result
}
