import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { CACHE_CONFIG } from '../config/cache'
import { CommonTypes, ReportDTOs } from '../types'

type ApiResponse<T> = CommonTypes.ApiResponse<T>

// Read-only screen: every endpoint is a query, there are no mutations.
const cacheFor = () => (CACHE_CONFIG.isEnabled() ? CACHE_CONFIG.DURATIONS.DETAIL : 0)

// Period-scoped cache key so switching months does not evict the previous month's data.
const periodTag = (prefix: string, year: number, month: number) =>
  [{ type: 'Report' as const, id: `${prefix}_${year}_${month}` }]

export const reportApi = createApi({
  reducerPath: 'reportApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Report'],
  endpoints: (build) => ({
    getReportSummary: build.query<ApiResponse<ReportDTOs.SummaryResponse>, ReportDTOs.SummaryRequest>({
      query: ({ year, month }) => ({
        url: ApiUrl.REPORT_SUMMARY.toString(),
        params: { year, month },
      }),
      providesTags: (_result, _error, { year, month }) => periodTag('SUMMARY', year, month),
      keepUnusedDataFor: cacheFor(),
    }),

    getReportTimeline: build.query<ApiResponse<ReportDTOs.TimelineResponse>, ReportDTOs.TimelineRequest>({
      query: ({ year, month, pastMonths, futureMonths }) => ({
        url: ApiUrl.REPORT_TIMELINE.toString(),
        params: { year, month, pastMonths, futureMonths },
      }),
      providesTags: (_result, _error, { year, month, pastMonths, futureMonths }) => [
        { type: 'Report', id: `TIMELINE_${year}_${month}_${pastMonths ?? ''}_${futureMonths ?? ''}` },
      ],
      keepUnusedDataFor: cacheFor(),
    }),

    getReportTagBreakdown: build.query<
      ApiResponse<ReportDTOs.TagBreakdownResponse>,
      ReportDTOs.TagBreakdownRequest
    >({
      query: ({ year, month, type, sumMode, limit }) => ({
        url: ApiUrl.REPORT_TAG_BREAKDOWN.toString(),
        params: { year, month, type, sumMode, limit },
      }),
      providesTags: (_result, _error, { year, month, type, sumMode }) => [
        { type: 'Report', id: `TAGS_${year}_${month}_${type ?? ''}_${sumMode ?? ''}` },
      ],
      keepUnusedDataFor: cacheFor(),
    }),

    getReportTopExpenses: build.query<
      ApiResponse<ReportDTOs.TopExpensesResponse>,
      ReportDTOs.TopExpensesRequest
    >({
      query: ({ year, month, type, limit }) => ({
        url: ApiUrl.REPORT_TOP_EXPENSES.toString(),
        params: { year, month, type, limit },
      }),
      providesTags: (_result, _error, { year, month, type }) => [
        { type: 'Report', id: `TOP_${year}_${month}_${type ?? ''}` },
      ],
      keepUnusedDataFor: cacheFor(),
    }),

    // No year/month: the server always looks back from its own current month.
    getReportRecurring: build.query<ApiResponse<ReportDTOs.RecurringResponse>, ReportDTOs.RecurringRequest>({
      query: ({ lookbackMonths, minOccurrence, limit }) => ({
        url: ApiUrl.REPORT_RECURRING.toString(),
        params: { lookbackMonths, minOccurrence, limit },
      }),
      providesTags: (_result, _error, { lookbackMonths, minOccurrence, limit }) => [
        { type: 'Report', id: `RECURRING_${lookbackMonths ?? ''}_${minOccurrence ?? ''}_${limit ?? ''}` },
      ],
      keepUnusedDataFor: cacheFor(),
    }),
  }),
})

export const {
  useGetReportSummaryQuery,
  useGetReportTimelineQuery,
  useGetReportTagBreakdownQuery,
  useGetReportTopExpensesQuery,
  useGetReportRecurringQuery,
} = reportApi
