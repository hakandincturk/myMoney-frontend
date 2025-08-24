import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'
import { CommonTypes } from '../types'

// Kısa alias'lar oluştur
type ApiResponse<T> = CommonTypes.ApiResponse<T>

export type CreateContactRequestDto = {
  fullName: string
  note?: string
}

export type UpdateMyContactRequestDto = {
  fullName: string
  note?: string
}

export type ListMyContactsResponseDto = {
  id: number
  fullName: string
  note?: string
}

export type SortablePageRequest = {
  pageNumber: number
  pageSize: number
  columnName: string
  asc: boolean
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

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Contact'],
  endpoints: (build) => ({
    listMyActiveContacts: build.query<ApiResponse<PagedResponse<ListMyContactsResponseDto>>, SortablePageRequest>({
      query: (pageData) => ({ 
        url: ApiUrl.CONTACT_MY_ACTIVE.toString(),
        params: pageData
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Contact' as const, id })),
              { type: 'Contact', id: 'LIST' }
            ]
          : [{ type: 'Contact', id: 'LIST' }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.CONTACT : 0,
    }),
    createContact: build.mutation<ApiResponse<any>, CreateContactRequestDto>({
      query: (body) => ({ url: ApiUrl.CONTACT_MY.toString(), method: 'POST', body }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }],
    }),
    updateMyContact: build.mutation<ApiResponse<any>, { contactId: number; body: UpdateMyContactRequestDto }>({
      query: ({ contactId, body }) => ({ url: ApiUrl.CONTACT_MY_BY_ID.toString().replace('{id}', contactId.toString()), method: 'PUT', body }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: 'Contact', id: contactId },
        { type: 'Contact', id: 'LIST' }
      ],
    }),
    deleteContact: build.mutation<ApiResponse<any>, { contactId: number }>({
      query: ({ contactId }) => ({ url: ApiUrl.CONTACT_MY_BY_ID.toString().replace('{id}', contactId.toString()), method: 'DELETE' }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: 'Contact', id: contactId },
        { type: 'Contact', id: 'LIST' }
      ],
    }),
  }),
})

export const { 
  useListMyActiveContactsQuery, 
  useCreateContactMutation, 
  useUpdateMyContactMutation, 
  useDeleteContactMutation 
} = contactApi


