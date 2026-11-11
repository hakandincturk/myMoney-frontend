import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistStore, persistReducer, createMigrate, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import type { PersistedState } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { authSlice } from '@/store/slices/authSlice'
import { authApi } from '@/services/authApi'
import { accountApi } from '@/services/accountApi'
import { contactApi } from '@/services/contactApi'
import { transactionApi } from '@/services/transactionApi'
import { tagApi } from '@/services/tagApi'
import { installmentApi } from '@/services/installmentApi'
import { dashboardApi } from '@/services/dashboardApi'
import { reportApi } from '@/services/reportApi'
import { financialCacheListener } from '@/store/financialCacheListener'

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [transactionApi.reducerPath]: transactionApi.reducer,
  [installmentApi.reducerPath]: installmentApi.reducer,
  [tagApi.reducerPath]: tagApi.reducer,
  [dashboardApi.reducerPath]: dashboardApi.reducer,
  [reportApi.reducerPath]: reportApi.reducer,
})

// Nothing is persisted any more. Server data never was (a restored dashboard would show old numbers),
// and auth state must not be either: the session is an HttpOnly cookie and GET /auth/me decides on start.
const PERSISTED_KEYS: string[] = []

const migrations = {
  // v1: drop the API caches earlier versions persisted, keep the session so nobody is logged out
  1: (state: PersistedState) => {
    if (!state) return state
    const kept = Object.fromEntries(
      Object.entries(state).filter(([key]) => key === '_persist' || PERSISTED_KEYS.includes(key))
    )
    return kept as PersistedState
  },
  // v2: drop the persisted auth slice (the JWT era); auth is resolved from the session cookie
  2: (state: PersistedState) => {
    if (!state) return state
    return { _persist: state._persist } as PersistedState
  },
}

const persistConfig = {
  key: 'root-v2',
  version: 2,
  storage,
  whitelist: PERSISTED_KEYS,
  migrate: createMigrate(migrations, { debug: false }),
  serialize: true,
  deserialize: true,
}

// Persist edilmiş reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Serializable check'i devre dışı bırak (RTK Query için)
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['authApi', 'accountApi', 'contactApi', 'transactionApi', 'tagApi', 'dashboardApi', 'reportApi'],
      },
    })
      // Refreshes every financial cache after any write; see financialCacheListener
      .prepend(financialCacheListener.middleware)
      .concat(
      authApi.middleware,
      accountApi.middleware,
      contactApi.middleware,
      transactionApi.middleware,
      installmentApi.middleware,
      tagApi.middleware,
      dashboardApi.middleware,
      reportApi.middleware,
    ),
  // Development'ta devtools'u etkinleştir
  devTools: import.meta.env.DEV,
})

// Persist store
export const persistor = persistStore(store)

// Enables refetchOnFocus / refetchOnReconnect for the slices that opt in (dashboard, reports)
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


