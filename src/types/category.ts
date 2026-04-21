export namespace CategoryDTOs {
  export type ListItem = {
    id: number
    name: string
  }

  // /category/my gibi yönetim ekranlarında kullanılan geniş liste öğesi
  export type ListItemWithMeta = {
    id: number
    name: string
    createdAt?: string
    transactionCount?: number
  }

  export type SortablePageRequest = {
    pageNumber?: number
    pageSize?: number
    columnName?: string
    asc?: boolean
  }

  export type FilterRequest = SortablePageRequest & {
    name?: string
  }

  export type PagedResponse<T> = {
    content: T[]
    pageNumber: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
  }

  // Kategori işlemleri (gelir/gider) tablosunda gösterilecek veriler
  export type Transaction = {
    id: number
    name: string
    accountName: string
    type: 'DEBT' | 'INCOME' | 'EXPENSE' | 'PAYMENT' | 'CREDIT'
    status: 'PENDING' | 'PARTIAL' | 'PAID'
    totalAmount: number
    paidAmount: number
    totalInstallment: number
  }

  export type TransactionFilterType = 'DEBT' | 'CREDIT' | 'PAYMENT' | 'COLLECTION'
  export type TransactionFilterStatus = 'PENDING' | 'PARTIAL' | 'PAID'

  export type TransactionFilterRequest = SortablePageRequest & {
    transactionName?: string
    accountIds?: number[]
    types?: TransactionFilterType[]
    statuses?: TransactionFilterStatus[]
    minAmount?: number
    maxAmount?: number
    minInstallmentCount?: number
    maxInstallmentCount?: number
  }

  export type TransactionPagedResponse = PagedResponse<Transaction>
}


