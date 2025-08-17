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
    description?: string
  }

  // İşlem listesi öğesi
  export type ListItem = {
    id: number
    description?: string
    paidAmount?: number
    status: TransactionStatus
    totalAmount: number
    totalInstallment?: number
    type: TransactionType
    accountId: number
    contactId?: number
    currency?: string
    accountType?: string
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
  // Durum metnini Türkçe'ye çevir
  export const getStatusText = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'Bekliyor'
      case TransactionStatus.PARTIAL:
        return 'Kısmi'
      case TransactionStatus.PAID:
        return 'Ödendi'
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

  // İşlem türü metnini Türkçe'ye çevir
  export const getTypeText = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEBT:
        return 'Borç oluşturma'
      case TransactionType.CREDIT:
        return 'Alacak oluşturma'
      case TransactionType.PAYMENT:
        return 'Ödeme yapma'
      case TransactionType.COLLECTION:
        return 'Tahsilat yapma'
      default:
        return type
    }
  }

  // İşlem türü seçeneklerini döndür
  export const getTypeOptions = () => [
    { value: TransactionType.DEBT, label: 'Borç oluşturma' },
    { value: TransactionType.CREDIT, label: 'Alacak oluşturma' },
    { value: TransactionType.PAYMENT, label: 'Ödeme yapma' },
    { value: TransactionType.COLLECTION, label: 'Tahsilat yapma' },
  ]
}
