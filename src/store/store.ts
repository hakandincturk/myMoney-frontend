import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from '@/store/slices/authSlice'
import { authApi } from '@/services/authApi'
import { accountApi } from '@/services/accountApi'
import { contactApi } from '@/services/contactApi'
import { transactionApi } from '@/services/transactionApi'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      accountApi.middleware,
      contactApi.middleware,
      transactionApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


