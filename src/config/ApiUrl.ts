export enum ApiUrl {
  // Transaction endpoints
  TRANSACTION = '/api/transaction/',
  TRANSACTION_MY = '/api/transaction/my',
  TRANSACTION_MY_BY_ID = '/api/transaction/my/{id}',
  TRANSACTION_BY_ID = '/api/transaction/{id}',
  
  // Account endpoints
  ACCOUNT = '/api/account/',
  ACCOUNT_MY = '/api/account/my',
  ACCOUNT_MY_ACTIVE = '/api/account/my/active',
  ACCOUNT_MY_BY_ID = '/api/account/my/{id}',
  ACCOUNT_BY_ID = '/api/account/{id}',
  
  // Contact endpoints
  CONTACT = '/api/contact/',
  CONTACT_MY = '/api/contact/my',
  CONTACT_MY_ACTIVE = '/api/contact/my/active',
  CONTACT_MY_BY_ID = '/api/contact/my/{id}',
  CONTACT_BY_ID = '/api/contact/{id}',
  
  // Installment endpoints
  INSTALLMENT_MONTH = '/api/installment/month/{month}/{year}',
  INSTALLMENT_PAY = '/api/installment/pay/{id}',
  
  // Auth endpoints
  AUTH_LOGIN = '/api/auth/login',
  AUTH_REGISTER = '/api/auth/register',
  AUTH_REFRESH = '/api/auth/refresh',
  AUTH_LOGOUT = '/api/auth/logout',
  
  // User endpoints
  USER_PROFILE = '/api/user/profile',
  USER_UPDATE = '/api/user/update',
}
