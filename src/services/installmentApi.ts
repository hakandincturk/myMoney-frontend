import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'

export type ListMyMonthlyInstallmentsItem = {
  id: number,
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

export type PayInstallmentRequest = {
  paidDate: string
}

export type PayInstallmentResponse = {
  type: boolean
  message?: string
  timestamp?: string
  data: any
}

export const installmentApi = createApi({
  reducerPath: 'installmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Installment'],
  endpoints: (build) => ({
    listMonthlyInstallments: build.query<ListMyMonthlyInstallmentsResponse, { month: number; year: number }>({
      query: ({ month, year }) => ({ 
        url: ApiUrl.INSTALLMENT_MONTH.toString().replace('{month}', month.toString()).replace('{year}', year.toString()) 
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((item, index) => ({ type: 'Installment' as const, id: `${item.id}-${index}` })),
              { type: 'Installment', id: 'LIST' },
            ]
          : [{ type: 'Installment', id: 'LIST' }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.TRANSACTION : 0,
    }),
    payInstallment: build.mutation<PayInstallmentResponse, { installmentId: number; data: PayInstallmentRequest }>({
      query: ({ installmentId, data }) => ({
        url: ApiUrl.INSTALLMENT_PAY.toString().replace('{id}', installmentId.toString()),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { installmentId }) => [
        { type: 'Installment', id: 'LIST' },
        { type: 'Installment', id: installmentId },
      ],
    }),
  }),
})

export const { useListMonthlyInstallmentsQuery, usePayInstallmentMutation } = installmentApi


