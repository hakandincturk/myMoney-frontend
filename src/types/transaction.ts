import { TransactionType, TransactionStatus } from '../enums'

// Transaction DTOs
export namespace TransactionDTOs {
  // Yeni işlem oluşturma isteği
  export type CreateRequest = {
    contactId?: number
    accountId: number
    type: TransactionType
    totalAmount: number
    totalInstallment?: number
    name?: string
    description?: string
    debtDate?: string
    equalSharingBetweenInstallments?: boolean
  }

  // İşlem listesi öğesi (yeni API response yapısına uygun)
  export type ListItem = {
    id: number
    name?: string
    contactName: string
    accountName: string
    type: string
    status: string
    totalAmount: number
    paidAmount: number
    totalInstallment: number
  }

  // Sayfalama parametreleri
  export type SortablePageRequest = {
    pageNumber?: number
    pageSize?: number
    columnName?: string
    asc?: boolean
  }

  // Sayfalama response yapısı
  export type PagedResponse<T> = {
    content: T[]
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
  }

  // İşlem güncelleme isteği
  export type UpdateRequest = {
    id: number
    description?: string
    totalAmount?: number
    status?: TransactionStatus
  }

  // İşlem detayı
  export type Detail = {
    id: number
    description?: string
    paidAmount: number
    status: TransactionStatus
    totalAmount: number
    totalInstallment?: number
    type: TransactionType
    accountId: number
    contactId?: number
    currency: string
    accountType: string
    createdAt: string
    updatedAt: string
  }
}

// Transaction Helper Functions
export namespace TransactionHelpers {
  // Durum metnini i18n ile al (t fonksiyonu parametre olarak alınmalı)
  export const getStatusText = (status: TransactionStatus, t: (key: string) => string): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return t('status.pending')
      case TransactionStatus.PARTIAL:
        return t('status.partial')
      case TransactionStatus.PAID:
        return t('status.paid')
      default:
        return status
    }
  }

  // Durum rengini belirle
  export const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'text-amber-600'
      case TransactionStatus.PARTIAL:
        return 'text-blue-600'
      case TransactionStatus.PAID:
        return 'text-emerald-600'
      default:
        return 'text-gray-600'
    }
  }

  // Durum background rengini belirle
  export const getStatusBackground = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700'
      case TransactionStatus.PARTIAL:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
      case TransactionStatus.PAID:
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-700'
    }
  }

  // İşlem türü metnini i18n ile al (t fonksiyonu parametre olarak alınmalı)
  export const getTypeText = (type: TransactionType, t: (key: string) => string): string => {
    switch (type) {
      case TransactionType.DEBT:
        return t('transaction.types.debt')
      case TransactionType.CREDIT:
        return t('transaction.types.credit')
      case TransactionType.PAYMENT:
        return t('transaction.types.payment')
      case TransactionType.COLLECTION:
        return t('transaction.types.collection')
      default:
        return type
    }
  }

  // İşlem türü seçeneklerini i18n ile döndür (t fonksiyonu parametre olarak alınmalı)
  export const getTypeOptions = (t: (key: string) => string) => {
    return [
      { value: TransactionType.DEBT, label: t('transaction.types.debt') },
      { value: TransactionType.CREDIT, label: t('transaction.types.credit') },
      { value: TransactionType.PAYMENT, label: t('transaction.types.payment') },
      { value: TransactionType.COLLECTION, label: t('transaction.types.collection') },
    ]
  }
}
