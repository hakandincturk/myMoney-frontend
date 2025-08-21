import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'

export type ListMyMonthlyInstallmentsItem = {
  transactionDetail: {
    id: number
    name: string
  }
  amount: number
  date: string
  installmentNumber: number
  descripton?: string
  paidDate?: string
  paid: boolean
}

export type ListMyMonthlyInstallmentsResponse = {
  type: boolean
  message?: string
  timestamp?: string
  data: ListMyMonthlyInstallmentsItem[]
}

export const installmentApi = createApi({
  reducerPath: 'installmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Installment'],
  endpoints: (build) => ({
    listMonthlyInstallments: build.query<ListMyMonthlyInstallmentsResponse, { month: number; year: number }>({
      query: ({ month, year }) => ({ url: `/api/installment/month/${month}/${year}` }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((item, index) => ({ type: 'Installment' as const, id: `${item.transactionDetail.name}-${item.installmentNumber}-${index}` })),
              { type: 'Installment', id: 'LIST' },
            ]
          : [{ type: 'Installment', id: 'LIST' }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.TRANSACTION : 0,
    }),
  }),
})

export const { useListMonthlyInstallmentsQuery } = installmentApi


