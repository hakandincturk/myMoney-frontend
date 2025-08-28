import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { TransactionType, TransactionStatus } from '../enums'
import { TransactionDTOs, CommonTypes } from '../types'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'

// Kısa alias'lar oluştur
type SortablePageRequest = TransactionDTOs.SortablePageRequest
type PagedResponse<T> = TransactionDTOs.PagedResponse<T>
type ListItem = TransactionDTOs.ListItem
type ApiResponse<T> = CommonTypes.ApiResponse<T>

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction'],
  endpoints: (build) => ({
    createTransaction: build.mutation<ApiResponse<{ id: number }>, TransactionDTOs.CreateRequest>({
      query: (body) => ({ url: ApiUrl.TRANSACTION.toString(), method: 'POST', body }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    listMyTransactions: build.query<ApiResponse<PagedResponse<ListItem>>, SortablePageRequest>({
      query: (pageData) => ({ 
        url: ApiUrl.TRANSACTION_MY.toString(),
        params: pageData
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' }
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.TRANSACTION : 0,
    }),
    getTransactionDetail: build.query<ApiResponse<TransactionDTOs.Detail>, number>({
      query: (id) => ({ url: ApiUrl.TRANSACTION_BY_ID.toString().replace('{id}', id.toString()) }),
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
    listTransactionInstallments: build.query<ApiResponse<Array<{ id: number; amount: number; debtDate: string; installmentNumber: number; descripton?: string; paidDate?: string; paid: boolean }>>, number>({
      query: (id) => ({ url: ApiUrl.TRANSACTION_INSTALLMENTS.toString().replace('{id}', id.toString()) }),
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
    updateTransaction: build.mutation<ApiResponse<{ id: number }>, TransactionDTOs.UpdateRequest>({
      query: ({ id, ...body }) => ({ url: ApiUrl.TRANSACTION_BY_ID.toString().replace('{id}', id.toString()), method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    deleteTransaction: build.mutation<ApiResponse<{ id: number }>, number>({
      query: (id) => ({ url: ApiUrl.TRANSACTION_MY_BY_ID.toString().replace('{id}', id.toString()), method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
  }),
})

export const { 
  useCreateTransactionMutation,
  useListMyTransactionsQuery,
  useGetTransactionDetailQuery,
  useListTransactionInstallmentsQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} = transactionApi

// Re-export enums for backward compatibility
export { TransactionType, TransactionStatus }


