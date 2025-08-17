// Common types that can be used across the application
export namespace CommonTypes {
  // API Response wrapper
  export type ApiResponse<T> = {
    type: boolean
    data: T
    message?: string
  }

  // Pagination types
  export type PaginationRequest = {
    page?: number
    size?: number
    sort?: string
    order?: 'asc' | 'desc'
  }

  export type PaginationResponse<T> = {
    content: T[]
    totalElements: number
    totalPages: number
    currentPage: number
    size: number
  }

  // Filter types
  export type DateRange = {
    startDate?: string
    endDate?: string
  }

  export type AmountRange = {
    minAmount?: number
    maxAmount?: number
  }

  // Status types
  export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED'
  export type SortOrder = 'asc' | 'desc'
}
