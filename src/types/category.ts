export namespace CategoryDTOs {
  export type ListItem = {
    id: number
    name: string
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


