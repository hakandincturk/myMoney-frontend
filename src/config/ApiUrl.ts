export enum ApiUrl {
  // Transaction endpoints
  TRANSACTION = '/transaction/',
  TRANSACTION_MY = '/transaction/my',
  TRANSACTION_MY_BY_ID = '/transaction/my/{id}',
  TRANSACTION_BY_ID = '/transaction/{id}',
  TRANSACTION_TAG_ID = '/transaction/tag/{id}',
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
  
  // Tag endpoints
  TAG = '/tag/',
  TAG_MY = '/tag/my',
  TAG_MY_ACTIVE = '/tag/my/active',
  TAG_MY_BY_ID = '/tag/my/{id}',
  TAG_BY_ID = '/tag/{id}',
  
  // Installment endpoints
  INSTALLMENT_MONTH = '/installment/month',
  INSTALLMENT_BY_ID = '/installment/{id}',
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
  DASHBOARD_TAG_SUMMARY = '/dashboard/tag-summary',
  DASHBOARD_LAST_TRANSACTIONS = '/dashboard/last-transactions',
  DASHBOARD_INCOMING_TRANSACTIONS = '/dashboard/incoming-transactions',

  // User endpoints
  USER_PROFILE = '/user/profile',
  USER_UPDATE = '/user/update',
}
