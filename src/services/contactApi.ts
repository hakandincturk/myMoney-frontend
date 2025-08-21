import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'

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

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Contact'],
  endpoints: (build) => ({
    listMyActiveContacts: build.query<{ type: boolean; data: ListMyContactsResponseDto[] }, void>({
      query: () => ({ url: '/api/contact/my/active' }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Contact' as const, id })),
              { type: 'Contact', id: 'LIST' }
            ]
          : [{ type: 'Contact', id: 'LIST' }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.CONTACT : 0,
    }),
    createContact: build.mutation<{ type: boolean }, CreateContactRequestDto>({
      query: (body) => ({ url: '/api/contact/my', method: 'POST', body }),
      invalidatesTags: [{ type: 'Contact', id: 'LIST' }],
    }),
    updateMyContact: build.mutation<{ type: boolean }, { contactId: number; body: UpdateMyContactRequestDto }>({
      query: ({ contactId, body }) => ({ url: `/api/contact/my/${contactId}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: 'Contact', id: contactId },
        { type: 'Contact', id: 'LIST' }
      ],
    }),
    deleteContact: build.mutation<{ type: boolean }, { contactId: number }>({
      query: ({ contactId }) => ({ url: `/api/contact/my/${contactId}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: 'Contact', id: contactId },
        { type: 'Contact', id: 'LIST' }
      ],
    }),
  }),
})

export const { useListMyActiveContactsQuery, useCreateContactMutation, useUpdateMyContactMutation, useDeleteContactMutation } = contactApi


