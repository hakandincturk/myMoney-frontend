import { ContactType, ContactStatus } from '../enums'

// Contact DTOs
export namespace ContactDTOs {
  // Yeni kişi oluşturma isteği
  export type CreateRequest = {
    fullName: string
    note?: string
    type?: ContactType
    phone?: string
    email?: string
  }

  // Kişi güncelleme isteği
  export type UpdateRequest = {
    fullName?: string
    note?: string
    type?: ContactType
    phone?: string
    email?: string
    status?: ContactStatus
  }

  // Kişi listesi öğesi
  export type ListItem = {
    id: number
    fullName: string
    note?: string
    type?: ContactType
    phone?: string
    email?: string
    status: ContactStatus
    transactionCount?: number
  }

  // Kişi detayı
  export type Detail = {
    id: number
    fullName: string
    note?: string
    type?: ContactType
    phone?: string
    email?: string
    status: ContactStatus
    createdAt: string
    updatedAt: string
    totalDebtAmount?: number
    totalCreditAmount?: number
    transactionCount?: number
  }

  // Kişi özeti
  export type Summary = {
    id: number
    fullName: string
    type?: ContactType
    status: ContactStatus
    lastTransactionDate?: string
  }
}

// Contact Helper Functions
export namespace ContactHelpers {
  // Kişi türü metnini Türkçe'ye çevir
  export const getTypeText = (type: ContactType): string => {
    switch (type) {
      case ContactType.PERSONAL:
        return 'Kişisel'
      case ContactType.BUSINESS:
        return 'İş'
      case ContactType.FAMILY:
        return 'Aile'
      case ContactType.FRIEND:
        return 'Arkadaş'
      default:
        return type
    }
  }

  // Kişi türü seçeneklerini döndür
  export const getTypeOptions = () => [
    { value: ContactType.PERSONAL, label: 'Kişisel' },
    { value: ContactType.BUSINESS, label: 'İş' },
    { value: ContactType.FAMILY, label: 'Aile' },
    { value: ContactType.FRIEND, label: 'Arkadaş' },
  ]

  // Kişi durumu metnini Türkçe'ye çevir
  export const getStatusText = (status: ContactStatus): string => {
    switch (status) {
      case ContactStatus.ACTIVE:
        return 'Aktif'
      case ContactStatus.INACTIVE:
        return 'Pasif'
      case ContactStatus.BLOCKED:
        return 'Engellenmiş'
      default:
        return status
    }
  }

  // Kişi durumu rengini belirle
  export const getStatusColor = (status: ContactStatus): string => {
    switch (status) {
      case ContactStatus.ACTIVE:
        return 'text-green-600'
      case ContactStatus.INACTIVE:
        return 'text-gray-600'
      case ContactStatus.BLOCKED:
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
}
