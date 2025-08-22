import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { TransactionType, TransactionStatus } from '../enums'
import { TransactionDTOs, CommonTypes } from '../types'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Transaction'],
  endpoints: (build) => ({
    createTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, TransactionDTOs.CreateRequest>({
      query: (body) => ({ url: ApiUrl.TRANSACTION.toString(), method: 'POST', body }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }],
    }),
    listMyTransactions: build.query<CommonTypes.ApiResponse<TransactionDTOs.ListItem[]>, void>({
      query: () => ({ url: ApiUrl.TRANSACTION_MY.toString() }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' }
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.TRANSACTION : 0,
    }),
    getTransactionDetail: build.query<CommonTypes.ApiResponse<TransactionDTOs.Detail>, number>({
      query: (id) => ({ url: ApiUrl.TRANSACTION_BY_ID.toString().replace('{id}', id.toString()) }),
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
    updateTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, TransactionDTOs.UpdateRequest>({
      query: ({ id, ...body }) => ({ url: ApiUrl.TRANSACTION_BY_ID.toString().replace('{id}', id.toString()), method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' }
      ],
    }),
    deleteTransaction: build.mutation<CommonTypes.ApiResponse<{ id: number }>, number>({
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
  useUpdateTransactionMutation,
  useDeleteTransactionMutation
} = transactionApi

// Re-export enums for backward compatibility
export { TransactionType, TransactionStatus }


