export enum ApiUrl {
  // Transaction endpoints
  TRANSACTION = '/transaction/',
  TRANSACTION_MY = '/transaction/my',
  TRANSACTION_MY_BY_ID = '/transaction/my/{id}',
  TRANSACTION_BY_ID = '/transaction/{id}',
  TRANSACTION_INSTALLMENTS = '/transaction/{id}/installments/',
  
  // Account endpoints
  ACCOUNT = '/account/',
  ACCOUNT_MY = '/account/my',
  ACCOUNT_MY_ACTIVE = '/account/my/active',
  ACCOUNT_MY_BY_ID = '/account/my/{id}',
  ACCOUNT_BY_ID = '/account/{id}',
  
  // Contact endpoints
  CONTACT = '/contact/',
  CONTACT_MY = '/contact/my',
  CONTACT_MY_ACTIVE = '/contact/my/active',
  CONTACT_MY_BY_ID = '/contact/my/{id}',
  CONTACT_BY_ID = '/contact/{id}',
  
  // Category endpoints (tahmini isimlendirme backend ile aynı pattern)
  CATEGORY = '/category/',
  CATEGORY_MY = '/category/my',
  CATEGORY_MY_ACTIVE = '/category/my/active',
  CATEGORY_MY_BY_ID = '/category/my/{id}',
  CATEGORY_BY_ID = '/category/{id}',
  
  // Installment endpoints
  INSTALLMENT_MONTH = '/installment/month',
  // Bulk pay endpoint (new): accepts body { ids: number[], paidDate: string }
  INSTALLMENT_PAY_BULK = '/installment/pay',
  
  // Auth endpoints
  AUTH_LOGIN = '/auth/login',
  AUTH_REGISTER = '/auth/register',
  AUTH_REFRESH = '/auth/refresh',
  AUTH_LOGOUT = '/auth/logout',
  
  // Dashboard endpoints
  DASHBOARD_QUICK_VIEW = '/dashboard/quick-view',
  DASHBOARD_MONTHLY_TREND = '/dashboard/monthly-trend',
  DASHBOARD_CATEGORY_SUMMARY = '/dashboard/category-summary',
  DASHBOARD_LAST_TRANSACTIONS = '/dashboard/last-transactions',
  DASHBOARD_INCOMING_TRANSACTIONS = '/dashboard/incoming-transactions',

  // User endpoints
  USER_PROFILE = '/user/profile',
  USER_UPDATE = '/user/update',
}
