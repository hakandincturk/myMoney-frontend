import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { AccountType, CurrencyType } from '../enums'
import { AccountDTOs, CommonTypes } from '../types'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'

// Kısa alias'lar oluştur
type ApiResponse<T> = CommonTypes.ApiResponse<T>
type SortablePageRequest = AccountDTOs.SortablePageRequest
type PagedResponse<T> = AccountDTOs.PagedResponse<T>

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Account'],
  endpoints: (build) => ({
    listMyActiveAccounts: build.query<ApiResponse<PagedResponse<AccountDTOs.ListItem>>, SortablePageRequest>({
      query: (pageData) => ({ 
        url: ApiUrl.ACCOUNT_MY_ACTIVE.toString(),
        params: pageData
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Account' as const, id })),
              { type: 'Account', id: 'LIST' }
            ]
          : [{ type: 'Account', id: 'LIST' }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.ACCOUNT : 0,
    }),
    createAccount: build.mutation<ApiResponse<{ id: number }>, AccountDTOs.CreateRequest>({
      query: (body) => ({ url: ApiUrl.ACCOUNT_MY.toString(), method: 'POST', body }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),
    updateMyAccount: build.mutation<ApiResponse<{ id: number }>, { accountId: number; body: AccountDTOs.UpdateRequest }>({
      query: ({ accountId, body }) => ({
        url: ApiUrl.ACCOUNT_MY_BY_ID.toString().replace('{id}', accountId.toString()),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Account', id: accountId },
        { type: 'Account', id: 'LIST' }
      ],
    }),
    getAccountDetail: build.query<ApiResponse<AccountDTOs.Detail>, number>({
      query: (id) => ({ url: ApiUrl.ACCOUNT_MY_BY_ID.toString().replace('{id}', id.toString()) }),
      providesTags: (result, error, id) => [{ type: 'Account', id }],
      // Cache'i environment variable'a göre tut
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
    deleteAccount: build.mutation<ApiResponse<{ id: number }>, number>({
      query: (id) => ({ url: ApiUrl.ACCOUNT_MY_BY_ID.toString().replace('{id}', id.toString()), method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' }
      ],
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


