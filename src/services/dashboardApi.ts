import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { CommonTypes, DashboardDTOs } from '../types'
import { CACHE_CONFIG } from '../config/cache'
import { ApiUrl } from '../config/ApiUrl'

type ApiResponse<T> = CommonTypes.ApiResponse<T>

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Dashboard'],
  endpoints: (build) => ({
    getQuickView: build.query<ApiResponse<DashboardDTOs.QuickViewResponseDto>, void>({
      query: () => ({ url: ApiUrl.DASHBOARD_QUICK_VIEW.toString() }),
      providesTags: [{ type: 'Dashboard', id: 'QUICK_VIEW' }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
  }),
})

export const { useGetQuickViewQuery } = dashboardApi


