import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { AccountType, CurrencyType } from '../enums'
import { AccountDTOs, CommonTypes } from '../types'

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Account'],
  endpoints: (build) => ({
    listMyActiveAccounts: build.query<CommonTypes.ApiResponse<AccountDTOs.ListItem[]>, void>({
      query: () => ({ url: '/api/account/my/active' }),
      providesTags: ['Account'],
    }),
    createAccount: build.mutation<CommonTypes.ApiResponse<{ id: number }>, AccountDTOs.CreateRequest>({
      query: (body) => ({ url: '/api/account/my', method: 'POST', body }),
      invalidatesTags: ['Account'],
    }),
    updateMyAccount: build.mutation<CommonTypes.ApiResponse<{ id: number }>, { accountId: number; body: AccountDTOs.UpdateRequest }>({
      query: ({ accountId, body }) => ({
        url: `/api/account/my/${accountId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Account'],
    }),
    getAccountDetail: build.query<CommonTypes.ApiResponse<AccountDTOs.Detail>, number>({
      query: (id) => ({ url: `/api/account/my/${id}` }),
      providesTags: ['Account'],
    }),
    deleteAccount: build.mutation<CommonTypes.ApiResponse<{ id: number }>, number>({
      query: (id) => ({ url: `/api/account/my/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Account'],
    }),
  }),
})

export const { 
  useListMyActiveAccountsQuery, 
  useCreateAccountMutation, 
  useUpdateMyAccountMutation,
  useGetAccountDetailQuery,
  useDeleteAccountMutation
} = accountApi

// Re-export enums for backward compatibility
export { AccountType, CurrencyType }


