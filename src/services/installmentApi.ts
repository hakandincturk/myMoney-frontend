import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'
import { InstallmentDTOs } from '../types/installment'
import { CommonTypes } from '../types'
import { dashboardApi } from './dashboardApi'

// Kısa alias'lar oluştur
type SortablePageRequest = InstallmentDTOs.SortablePageRequest
type PagedResponse<T> = InstallmentDTOs.PagedResponse<T>
type ListItem = InstallmentDTOs.ListItem
type FilterRequest = InstallmentDTOs.FilterRequest
type UpdateRequest = InstallmentDTOs.UpdateRequest
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
    // Bulk pay mutation - accepts body with `ids: number[]` and `paidDate`
    payInstallments: build.mutation<ApiResponse<null>, { data: InstallmentDTOs.PayRequest }>({
      query: ({ data }) => ({
        url: ApiUrl.INSTALLMENT_PAY_BULK.toString(),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [{ type: 'Installment', id: 'LIST' }],
    }),
    updateInstallment: build.mutation<ApiResponse<null>, { id: number } & UpdateRequest>({
      query: ({ id, ...body }) => ({
        url: ApiUrl.INSTALLMENT_BY_ID.toString().replace('{id}', id.toString()),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Installment', id: 'LIST' }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(dashboardApi.util.invalidateTags([{ type: 'Dashboard', id: 'QUICK_VIEW' }, { type: 'Dashboard', id: 'INCOMING_TRANSACTIONS' }]))
      },
    }),
  }),
})

export const { useListMonthlyInstallmentsQuery, usePayInstallmentsMutation, useUpdateInstallmentMutation } = installmentApi


