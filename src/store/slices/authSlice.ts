import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthState = {
  token: string | null
}

const initialState: AuthState = {
  token: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload
    },
    logout(state) {
      state.token = null
    },
  },
})


