import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'
import { InstallmentDTOs } from '../types/installment'
import { CommonTypes } from '../types'

// Kısa alias'lar oluştur
type SortablePageRequest = InstallmentDTOs.SortablePageRequest
type PagedResponse<T> = InstallmentDTOs.PagedResponse<T>
type ListItem = InstallmentDTOs.ListItem
type FilterRequest = InstallmentDTOs.FilterRequest
type ApiResponse<T> = CommonTypes.ApiResponse<T>

export const installmentApi = createApi({
  reducerPath: 'installmentApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Installment'],
  endpoints: (build) => ({
    listMonthlyInstallments: build.query<ApiResponse<PagedResponse<ListItem>>, FilterRequest>({
      query: (filterData) => ({ 
        url: ApiUrl.INSTALLMENT_MONTH.toString(),
        params: filterData
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map((item, index) => ({ type: 'Installment' as const, id: `${item.id}-${index}` })),
              { type: 'Installment', id: 'LIST' },
            ]
          : [{ type: 'Installment', id: 'LIST' }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.TRANSACTION : 0,
    }),
    payInstallment: build.mutation<ApiResponse<any>, { installmentId: number; data: InstallmentDTOs.PayRequest }>({
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
    // Bulk pay mutation - accepts body with `ids: number[]` and `paidDate`
    payInstallments: build.mutation<ApiResponse<any>, { data: InstallmentDTOs.PayRequest }>({
      query: ({ data }) => ({
        url: ApiUrl.INSTALLMENT_PAY_BULK.toString(),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result) => [
        { type: 'Installment', id: 'LIST' },
      ],
    }),
  }),
})

export const { useListMonthlyInstallmentsQuery, usePayInstallmentMutation, usePayInstallmentsMutation } = installmentApi


