import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'

export enum AccountType {
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  BANK = 'BANK',
}

export enum CurrencyType {
  TL = 'TL',
  USD = 'USD',
  EUR = 'EUR',
}

export type CreateAccountRequestDto = {
  name: string
  type: AccountType
  currency: CurrencyType
  balance: number
}

export type UpdateAccountRequestDto = {
  name: string
  totalBalance: number
}

export type ListMyAccountsResponseDto = {
  id: number
  name: string
  totalBalance: number
  balance: number
  currency: CurrencyType
  type: AccountType
}

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Account'],
  endpoints: (build) => ({
    listMyActiveAccounts: build.query<{ type: boolean; data: ListMyAccountsResponseDto[] }, void>({
      query: () => ({ url: '/api/account/my/active' }),
      providesTags: ['Account'],
    }),
    createAccount: build.mutation<{ type: boolean }, CreateAccountRequestDto>({
      query: (body) => ({ url: '/api/account/my', method: 'POST', body }),
      invalidatesTags: ['Account'],
    }),
    updateMyAccount: build.mutation<{ type: boolean }, { accountId: number; body: UpdateAccountRequestDto }>({
      query: ({ accountId, body }) => ({
        url: `/api/account/my/${accountId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Account'],
    }),
  }),
})

export const { useListMyActiveAccountsQuery, useCreateAccountMutation, useUpdateMyAccountMutation } = accountApi


