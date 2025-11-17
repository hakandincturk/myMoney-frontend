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
    getMonthlyTrend: build.query<ApiResponse<DashboardDTOs.MonthlyTrend>, void>({
      query: () => ({ url: ApiUrl.DASHBOARD_MONTHLY_TREND.toString() }),
      providesTags: [{ type: 'Dashboard', id: 'MONTHLY_TREND' }],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
    getCategorySummary: build.query<
      ApiResponse<DashboardDTOs.CategorySummary>, 
      DashboardDTOs.CategorySummaryRequest & DashboardDTOs.CategorySummaryParams
    >({
      query: ({ startDate, endDate, type, sumMode }) => ({
        url: `${ApiUrl.DASHBOARD_CATEGORY_SUMMARY.toString()}?type=${type}&sumMode=${sumMode}`,
        method: 'POST',
        body: {
          startDate,
          endDate,
        },
      }),
      providesTags: (result, error, { type, sumMode, startDate, endDate }) => [
        { type: 'Dashboard', id: `CATEGORY_SUMMARY_${type}_${sumMode}_${startDate}_${endDate}` }
      ],
      keepUnusedDataFor: CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0,
    }),
  }),
})

export const { 
  useGetQuickViewQuery, 
  useGetMonthlyTrendQuery, 
  useGetCategorySummaryQuery 
} = dashboardApi


