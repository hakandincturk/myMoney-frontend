import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export enum TransactionType {
  DEBT = 'DEBT',
  CREDIT = 'CREDIT',
  PAYMENT = 'PAYMENT',
  COLLECTION = 'COLLECTION',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
}

export type CreateTransactionRequestDto = {
  contactId?: number
  accountId: number
  type: TransactionType
  totalAmount: number
  totalInstallment?: number
  description?: string
}

export type TransactionListItem = {
  id: number
  description?: string
  paidAmount?: number
  status: TransactionStatus
  totalAmount: number
  totalInstallment?: number
  type: TransactionType
  accountId: number
  contactId?: number
  currency?: string
  accountType?: string
}

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery,
  tagTypes: ['Transaction'],
  endpoints: (build) => ({
    createTransaction: build.mutation<{ type: boolean }, CreateTransactionRequestDto>({
      query: (body) => ({ url: '/api/transaction/', method: 'POST', body }),
      invalidatesTags: ['Transaction'],
    }),
  }),
})

export const { useCreateTransactionMutation } = transactionApi


