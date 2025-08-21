import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { BrowserRouter } from 'react-router-dom'
import { store, persistor } from '@/store/store'
import App from '@/pages/App'
import '@/styles/index.css'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './i18n' // i18n konfigürasyonunu import et
import { CACHE_CONFIG } from './config/cache'

// Cache aktifse PersistGate kullan, değilse direkt render et
const AppWithCache = () => {
  if (CACHE_CONFIG.isEnabled()) {
    return (
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    )
  }
  
  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppWithCache />
    </Provider>
  </React.StrictMode>,
)


