import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthState = {
  token: string | null
}

// localStorage'dan token'ı oku
const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

const initialState: AuthState = {
  token: getInitialToken(),
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload
      // localStorage'a kaydet
      if (action.payload) {
        localStorage.setItem('auth_token', action.payload)
      } else {
        localStorage.removeItem('auth_token')
      }
    },
    logout(state) {
      state.token = null
      localStorage.removeItem('auth_token')
    },
  },
})


