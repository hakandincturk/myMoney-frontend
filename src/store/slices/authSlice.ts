import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// The session lives in an HttpOnly cookie the app cannot read. The app only knows whether
// the backend accepted it: 'unknown' until GET /auth/me answers on start.
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous'

export type AuthUser = {
  id?: number
  fullName: string
  email: string
}

export type AuthState = {
  status: AuthStatus
  user: AuthUser | null
}

// Older builds kept a JWT here; remove it so no stale credential lingers in localStorage.
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('auth_token')
  } catch {
    // storage unavailable (private mode): nothing to clean
  }
}

const initialState: AuthState = {
  status: 'unknown',
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.status = 'authenticated'
      state.user = action.payload
    },
    setAnonymous(state) {
      state.status = 'anonymous'
      state.user = null
    },
    clearAuth(state) {
      state.status = 'anonymous'
      state.user = null
    },
  },
})

export const { setUser, setAnonymous, clearAuth } = authSlice.actions
export default authSlice.reducer
