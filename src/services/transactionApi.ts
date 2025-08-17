import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'

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
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction'],
  endpoints: (build) => ({
    createTransaction: build.mutation<{ type: boolean }, CreateTransactionRequestDto>({
      query: (body) => ({ url: '/api/transaction/', method: 'POST', body }),
      invalidatesTags: ['Transaction'],
    }),
  }),
})

export const { useCreateTransactionMutation } = transactionApi


