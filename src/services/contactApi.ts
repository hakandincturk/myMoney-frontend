import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'

const baseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

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
  baseQuery,
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


