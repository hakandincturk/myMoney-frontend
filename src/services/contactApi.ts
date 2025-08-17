import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'

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
      providesTags: ['Contact'],
    }),
    createContact: build.mutation<{ type: boolean }, CreateContactRequestDto>({
      query: (body) => ({ url: '/api/contact/my', method: 'POST', body }),
      invalidatesTags: ['Contact'],
    }),
    updateMyContact: build.mutation<{ type: boolean }, { contactId: number; body: UpdateMyContactRequestDto }>({
      query: ({ contactId, body }) => ({ url: `/api/contact/my/${contactId}`, method: 'PUT', body }),
      invalidatesTags: ['Contact'],
    }),
    deleteContact: build.mutation<{ type: boolean }, { contactId: number }>({
      query: ({ contactId }) => ({ url: `/api/contact/my/${contactId}`, method: 'DELETE' }),
      invalidatesTags: ['Contact'],
    }),
  }),
})

export const { useListMyActiveContactsQuery, useCreateContactMutation, useUpdateMyContactMutation, useDeleteContactMutation } = contactApi


