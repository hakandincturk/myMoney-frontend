import { AccountType, CurrencyType } from '../enums'

// Account DTOs
export namespace AccountDTOs {
  // Sayfalama ve sıralama isteği
  export type SortablePageRequest = {
    pageNumber: number
    pageSize: number
    columnName: string
    asc: boolean
  }

  // Sayfalama response'u
  export type PagedResponse<T> = {
    content: T[]
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
  }

  // Yeni hesap oluşturma isteği
  export type CreateRequest = {
    name: string
    type: AccountType
    currency: CurrencyType
    balance: number
  }

  // Hesap güncelleme isteği
  export type UpdateRequest = {
    name: string
    totalBalance: number
  }

  // Hesap listesi öğesi
  export type ListItem = {
    id: number
    name: string
    totalBalance: number
    balance: number
    currency: CurrencyType
    type: AccountType
  }

  // Hesap detayı
  export type Detail = {
    id: number
    name: string
    totalBalance: number
    balance: number
    currency: CurrencyType
    type: AccountType
    createdAt: string
    updatedAt: string
    isActive: boolean
  }

  // Hesap özeti
  export type Summary = {
    id: number
    name: string
    type: AccountType
    currency: CurrencyType
    totalBalance: number
    transactionCount: number
  }
}

// Account Helper Functions
export namespace AccountHelpers {
  // Hesap türü metnini Türkçe'ye çevir
  export const getTypeText = (type: AccountType): string => {
    switch (type) {
      case AccountType.CREDIT_CARD:
        return 'Kredi Kartı'
      case AccountType.CASH:
        return 'Nakit'
      case AccountType.BANK:
        return 'Banka Hesabı'
      default:
        return type
    }
  }

  // Hesap türü seçeneklerini döndür
  export const getTypeOptions = () => [
    { value: AccountType.CREDIT_CARD, label: 'Kredi Kartı' },
    { value: AccountType.CASH, label: 'Nakit' },
    { value: AccountType.BANK, label: 'Banka Hesabı' },
  ]

  // Para birimi sembolünü döndür
  export const getCurrencySymbol = (currency: CurrencyType): string => {
    switch (currency) {
      case CurrencyType.TL:
        return '₺'
      case CurrencyType.USD:
        return '$'
      case CurrencyType.EUR:
        return '€'
      default:
        return currency
    }
  }

  // Para birimi seçeneklerini döndür
  export const getCurrencyOptions = () => [
    { value: CurrencyType.TL, label: 'Türk Lirası (₺)' },
    { value: CurrencyType.USD, label: 'USD ($)' },
    { value: CurrencyType.EUR, label: 'Euro (€)' },
  ]
}
