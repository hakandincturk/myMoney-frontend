# MyMoney Frontend - Proje Mimarisi ve Teknik Dokümantasyon

## 📋 Genel Bakış

MyMoney Frontend, React 18 + TypeScript + Vite tabanlı bir finansal yönetim uygulamasıdır. Modern web teknolojileri kullanılarak geliştirilmiş, kullanıcı dostu bir arayüze sahip borç/hesap takip sistemidir.

## 🏗️ Teknoloji Stack

### Core Technologies
- **React 18.3.1** - UI kütüphanesi
- **TypeScript 5.9.2** - Tip güvenliği
- **Vite 5.4.19** - Build tool ve dev server
- **Tailwind CSS 3.4.10** - Styling framework

### State Management
- **Redux Toolkit 2.8.2** - State yönetimi
- **RTK Query** - Server state yönetimi ve caching
- **Redux Persist 6.0.0** - State persistence

### UI/UX Libraries
- **React Router DOM 6.30.1** - Client-side routing
- **React i18next 15.6.1** - Internationalization (TR/EN)
- **Chart.js 4.5.0 + React Chart.js 2** - Grafik ve chart'lar
- **React Transition Group 4.4.5** - Animasyonlar
- **FontAwesome** - Icon set

### Development Tools
- **PostCSS + Autoprefixer** - CSS processing
- **ESLint/TypeScript** - Code quality
- **Zod 4.0.17** - Runtime validation

## 📁 Proje Yapısı

```
src/
├── components/           # Yeniden kullanılabilir UI bileşenleri
│   ├── ui/              # Temel UI bileşenleri (Button, Input, Card, etc.)
│   ├── dashboard/       # Dashboard özel bileşenleri
│   ├── ProtectedRoute.tsx
│   └── AuthRedirect.tsx
├── pages/               # Sayfa bileşenleri
│   ├── screens/         # Ana sayfa bileşenleri
│   ├── layouts/         # Layout bileşenleri
│   └── routes/          # Route tanımları
├── services/            # API servisleri (RTK Query)
├── store/               # Redux store ve slices
├── types/               # TypeScript tip tanımları
├── enums/               # Enum tanımları
├── hooks/               # Custom React hooks
├── utils/               # Utility fonksiyonları
├── config/              # Konfigürasyon dosyaları
├── i18n/                # Çok dil desteği
└── styles/              # Global CSS
```

## 🔄 State Yönetimi

### Redux Store Yapısı

```typescript
// store.ts
const rootReducer = combineReducers({
  auth: authSlice.reducer,           // Authentication state
  authApi: authApi.reducer,          // Auth API endpoints
  accountApi: accountApi.reducer,    // Account API endpoints
  contactApi: contactApi.reducer,    // Contact API endpoints
  transactionApi: transactionApi.reducer, // Transaction API endpoints
  installmentApi: installmentApi.reducer, // Installment API endpoints
  categoryApi: categoryApi.reducer,  // Category API endpoints
  dashboardApi: dashboardApi.reducer // Dashboard API endpoints
})
```

### Auth State Management

```typescript
// authSlice.ts
type AuthState = {
  token: string | null
}

// Actions:
- setToken(token)     // Token'ı set et ve localStorage'a kaydet
- logout()           // Çıkış yap ve token'ı temizle
- clearAuth()        // Auth state'i temizle
```

### RTK Query API Services

Her API servisi ayrı bir RTK Query instance'ı olarak organize edilmiştir:

- **authApi**: Login/Register işlemleri
- **accountApi**: Hesap CRUD işlemleri
- **contactApi**: Kişi CRUD işlemleri
- **transactionApi**: İşlem CRUD işlemleri
- **installmentApi**: Taksit işlemleri
- **categoryApi**: Kategori işlemleri
- **dashboardApi**: Dashboard verileri

## 🌐 API İletişimi

### Base API Configuration

```typescript
// baseApi.ts
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  }
})
```

### Error Handling

- **401 Unauthorized**: Token'ı temizle, login sayfasına yönlendir
- **500 Internal Server Error**: Toast notification göster
- **Development Mode**: Detaylı hata bilgileri console'da

### API Endpoints

Tüm endpoint'ler `ApiUrl` enum'unda merkezi olarak tanımlanmıştır:

```typescript
// ApiUrl.ts
export enum ApiUrl {
  // Auth endpoints
  AUTH_LOGIN = '/api/auth/login',
  AUTH_REGISTER = '/api/auth/register',
  
  // Transaction endpoints
  TRANSACTION = '/api/transaction/',
  TRANSACTION_MY = '/api/transaction/my',
  
  // Account endpoints
  ACCOUNT_MY = '/api/account/my',
  ACCOUNT_MY_ACTIVE = '/api/account/my/active',
  
  // Contact endpoints
  CONTACT_MY = '/api/contact/my',
  CONTACT_MY_ACTIVE = '/api/contact/my/active',
  
  // Dashboard endpoints
  DASHBOARD_QUICK_VIEW = '/api/dashboard/quick-view'
}
```

## 🗂️ Routing Yapısı

### Route Hierarchy

```typescript
// AppRoutes.tsx
<Routes>
  {/* Protected Routes */}
  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
  <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
  <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
  <Route path="/debts/overview" element={<ProtectedRoute><DebtsOverviewPage /></ProtectedRoute>} />
  <Route path="/installments" element={<ProtectedRoute><InstallmentsPage /></ProtectedRoute>} />
  
  {/* Public Routes */}
  <Route path="/login" element={<ProtectedRoute requireAuth={false}><LoginPage /></ProtectedRoute>} />
  <Route path="/register" element={<ProtectedRoute requireAuth={false}><RegisterPage /></ProtectedRoute>} />
  
  {/* Default redirect */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
```

### Protected Route Logic

- `requireAuth={true}`: Authentication gerekli
- `requireAuth={false}`: Authentication gereksiz (giriş yapmışsa ana sayfaya yönlendir)

## 🌍 Internationalization (i18n)

### Dil Desteği

- **Türkçe (TR)**: Varsayılan dil
- **İngilizce (EN)**: İkinci dil

### Dil Dosyaları

```typescript
// i18n/index.ts
const resources = {
  tr: { translation: tr },  // src/i18n/locales/tr.json
  en: { translation: en }   // src/i18n/locales/en.json
}
```

### Dil Algılama

```typescript
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage']
}
```

## 🎨 UI/UX Architecture

### Component Hierarchy

```
App
├── ThemeProvider (Dark/Light mode)
├── LanguageToggle
├── Header
├── AppLayout
│   ├── Sidebar Navigation
│   └── Main Content Area
│       ├── HomePage
│       │   ├── DashboardStats
│       │   ├── DashboardCharts
│       │   └── QuickActions
│       ├── ContactsPage
│       ├── AccountsPage
│       ├── DebtsOverviewPage
│       └── InstallmentsPage
└── ToastContainer
```

### UI Components

#### Core Components (`src/components/ui/`)
- **Button**: Çeşitli variant'lar (primary, secondary, danger)
- **Input**: Form input'ları
- **Card**: İçerik container'ları
- **Modal**: Popup'lar
- **Table**: Veri tabloları
- **Toast**: Bildirimler
- **Skeleton**: Loading states
- **StatusBadge**: Durum göstergeleri

#### Dashboard Components (`src/components/dashboard/`)
- **DashboardStats**: Özet kartları
- **DashboardCharts**: Grafik bileşenleri
- **QuickActions**: Hızlı erişim linkleri

### Styling Strategy

- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: CSS variables ile tema desteği
- **Responsive Design**: Mobile-first yaklaşım
- **Component Variants**: Consistent design system

## 📊 Data Flow

### 1. Authentication Flow

```
Login Form → authApi.login → Redux Store (authSlice) → localStorage
                                                      ↓
Protected Routes ← Token Check ← Auth State ← Redux Store
```

### 2. Data Fetching Flow

```
Component → RTK Query Hook → baseApi → Backend API
                                    ↓
Component ← Data ← Redux Store ← RTK Query Cache
```

### 3. Error Handling Flow

```
API Error → baseQueryWithReauth → Error Classification
                                        ↓
401: Clear Auth + Redirect to Login
500: Show Toast Notification
Other: Standard Error Handling
```

## 🔧 Configuration Management

### Environment Configuration

```typescript
// config/environment.ts
export const ENV_CONFIG = {
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getApiBaseUrl: () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
}
```

### Cache Configuration

```typescript
// config/cache.ts
export const CACHE_CONFIG = {
  ENABLED: import.meta.env.VITE_ENABLE_CACHE === 'true',
  DURATIONS: {
    CONTACT: 1800,      // 30 dakika
    ACCOUNT: 1800,      // 30 dakika
    TRANSACTION: 1800,  // 30 dakika
    DETAIL: 3600        // 1 saat
  }
}
```

## 🚀 Build ve Deployment

### Build Commands

```json
{
  "scripts": {
    "dev": "vite",                    // Development server
    "build": "tsc && vite build",     // Production build
    "preview": "vite preview",        // Build preview
    "type-check": "tsc --noEmit"      // Type checking
  }
}
```

### Build Output

```
dist/
├── assets/           # Bundled JS/CSS files
├── index.html        # Main HTML file
└── ...
```

## 🔍 Development Features

### Hot Module Replacement (HMR)
- Vite ile hızlı development
- Component değişikliklerinde anında güncelleme

### TypeScript Integration
- Strict type checking
- Interface definitions
- Enum usage for constants

### Development Tools
- Redux DevTools integration
- Console logging in development
- Error boundary implementations

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Tailwind CSS responsive utilities
- Touch-friendly interface
- Optimized navigation for mobile

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage

### Authorization
- Protected routes
- Role-based access control (prepared for future)
- API request authorization headers

### Data Protection
- XSS protection via React
- CSRF protection via SameSite cookies
- Input validation with Zod

## 🧪 Testing Strategy

### Current State
- TypeScript compile-time checking
- ESLint code quality checks
- Manual testing procedures

### Future Enhancements
- Unit tests with Jest/Vitest
- Integration tests with Testing Library
- E2E tests with Playwright

## 📈 Performance Optimizations

### Code Splitting
- Lazy loading for page components
- Dynamic imports for heavy libraries

### Caching Strategy
- RTK Query automatic caching
- Redux Persist for state persistence
- Browser cache for static assets

### Bundle Optimization
- Vite's tree shaking
- Dynamic imports for charts
- Optimized asset loading

## 🚨 Error Handling

### Client-Side Errors
- React Error Boundaries
- Toast notifications for user feedback
- Console logging for debugging

### Network Errors
- Retry mechanisms in RTK Query
- Offline state handling
- Graceful degradation

### API Errors
- Centralized error handling in baseApi
- User-friendly error messages
- Development vs production error details

## 🔄 State Persistence

### Redux Persist Configuration
```typescript
const persistConfig = {
  key: 'root-v2',
  storage: localStorage,
  whitelist: CACHE_CONFIG.isEnabled() 
    ? ['auth', 'authApi', 'accountApi', ...] 
    : ['auth']
}
```

### Persisted Data
- Authentication state
- API cache (if enabled)
- User preferences (theme, language)

## 📋 Future Enhancements

### Planned Features
- Advanced filtering and search
- Data export functionality
- Push notifications
- Offline support with service workers
- Progressive Web App (PWA) features

### Technical Improvements
- Unit and integration testing
- Performance monitoring
- Error tracking and analytics
- Automated deployment pipeline

---

## 📚 Kaynaklar

### Dokümantasyon
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### API Documentation
- Backend API: `endpoints.json` dosyası
- OpenAPI 3.1.0 specification
- Swagger UI integration (backend)

Bu dokümantasyon, MyMoney Frontend projesinin teknik mimarisini ve implementasyon detaylarını kapsamlı bir şekilde açıklamaktadır. Proje geliştikçe bu dokümantasyon da güncellenmelidir.
