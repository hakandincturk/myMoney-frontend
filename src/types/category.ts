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
}


