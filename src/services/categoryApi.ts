import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { CommonTypes, CategoryDTOs } from '../types'

type ApiResponse<T> = CommonTypes.ApiResponse<T>
type PagedResponse<T> = CategoryDTOs.PagedResponse<T>

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Category'],
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
  }),
})

export const { useListMyCategoriesQuery, useListMyActiveCategoriesQuery } = categoryApi


