// Installment DTOs
export namespace InstallmentDTOs {
  // Aylık taksit listesi öğesi
  export type ListItem = {
    id: number
    transaction: {
      id: number
      name: string
      type?: 'DEBT' | 'CREDIT' | 'PAYMENT' | 'COLLECTION'
    }
    amount: number
    debtDate: string
    installmentNumber: number
    descripton?: string
    paidDate?: string
    paid: boolean
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

  // Taksit ödeme isteği
  export type PayRequest = {
    paidDate: string
  }
}
