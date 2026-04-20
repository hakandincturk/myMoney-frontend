import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { CommonTypes, CategoryDTOs } from '../types'

type ApiResponse<T> = CommonTypes.ApiResponse<T>
type PagedResponse<T> = CategoryDTOs.PagedResponse<T>

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category', 'CategoryTransaction'],
  endpoints: (build) => ({
    listMyCategories: build.query<ApiResponse<PagedResponse<CategoryDTOs.ListItemWithMeta>>, CategoryDTOs.FilterRequest>({
      query: (filterData) => ({
        url: ApiUrl.CATEGORY_MY.toString(),
        params: filterData,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' }
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    listMyActiveCategories: build.query<ApiResponse<PagedResponse<CategoryDTOs.ListItem>>, CategoryDTOs.FilterRequest>({
      query: (filterData) => ({
        url: ApiUrl.CATEGORY_MY_ACTIVE.toString(),
        params: filterData,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' }
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    getTransactionsByCategory: build.query<
      ApiResponse<CategoryDTOs.TransactionPagedResponse>,
      { categoryId: number; pageData?: CategoryDTOs.TransactionFilterRequest }
    >({
      query: ({ categoryId, pageData = { pageNumber: 0, pageSize: 10 } }) => ({
        url: `${ApiUrl.TRANSACTION_CATEGORY_ID}`.toString().replace('{id}', categoryId.toString()),
        method: 'POST',
        body: pageData,
      }),
      providesTags: (result, _error, { categoryId }) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({
                type: 'CategoryTransaction' as const,
                id,
              })),
              { type: 'CategoryTransaction', id: `CATEGORY_${categoryId}` },
            ]
          : [{ type: 'CategoryTransaction', id: `CATEGORY_${categoryId}` }],
    }),
  }),
})

export const { useListMyCategoriesQuery, useListMyActiveCategoriesQuery, useGetTransactionsByCategoryQuery } = categoryApi


