import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { authSlice } from '@/store/slices/authSlice'
import { authApi } from '@/services/authApi'
import { accountApi } from '@/services/accountApi'
import { contactApi } from '@/services/contactApi'
import { transactionApi } from '@/services/transactionApi'
import { categoryApi } from '@/services/categoryApi'
import { installmentApi } from '@/services/installmentApi'
import { CACHE_CONFIG } from '../config/cache'

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [contactApi.reducerPath]: contactApi.reducer,
  [transactionApi.reducerPath]: transactionApi.reducer,
  [installmentApi.reducerPath]: installmentApi.reducer,
  [categoryApi.reducerPath]: categoryApi.reducer,
})

// Persist konfigürasyonu - sadece cache aktifse
const persistConfig = {
  key: 'root-v2',
  storage,
  whitelist: CACHE_CONFIG.isEnabled() 
    ? ['auth', 'authApi', 'accountApi', 'contactApi', 'transactionApi', 'installmentApi', 'categoryApi']
    : ['auth'],
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
        ignoredPaths: ['authApi', 'accountApi', 'contactApi', 'transactionApi', 'categoryApi'],
      },
    }).concat(
      authApi.middleware,
      accountApi.middleware,
      contactApi.middleware,
      transactionApi.middleware,
      installmentApi.middleware,
      categoryApi.middleware,
    ),
  // Development'ta devtools'u etkinleştir
  devTools: import.meta.env.DEV,
})

// Persist store
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


