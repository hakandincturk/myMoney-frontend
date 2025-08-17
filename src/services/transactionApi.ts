import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { TransactionType, TransactionStatus } from '../enums'
import { TransactionDTOs, CommonTypes } from '../types'

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction'],
  endpoints: (build) => ({
    createTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, TransactionDTOs.CreateRequest>({
      query: (body) => ({ url: '/api/transaction/', method: 'POST', body }),
      invalidatesTags: ['Transaction'],
    }),
    listMyTransactions: build.query<CommonTypes.ApiResponse<TransactionDTOs.ListItem[]>, void>({
      query: () => ({ url: '/api/transaction/my' }),
      providesTags: ['Transaction'],
    }),
    getTransactionDetail: build.query<CommonTypes.ApiResponse<TransactionDTOs.Detail>, number>({
      query: (id) => ({ url: `/api/transaction/${id}` }),
      providesTags: ['Transaction'],
    }),
    updateTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, TransactionDTOs.UpdateRequest>({
      query: ({ id, ...body }) => ({ url: `/api/transaction/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Transaction'],
    }),
    deleteTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, number>({
      query: (id) => ({ url: `/api/transaction/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Transaction'],
    }),
  }),
})

export const { 
  useCreateTransactionMutation,
  useListMyTransactionsQuery,
  useGetTransactionDetailQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} = transactionApi

// Re-export enums for backward compatibility
export { TransactionType, TransactionStatus }


