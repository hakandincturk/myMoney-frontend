import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { CommonTypes, TagDTOs } from '../types'

type ApiResponse<T> = CommonTypes.ApiResponse<T>
type PagedResponse<T> = TagDTOs.PagedResponse<T>

export const tagApi = createApi({
  reducerPath: 'tagApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tag', 'TagTransaction'],
  endpoints: (build) => ({
    listMyTags: build.query<ApiResponse<PagedResponse<TagDTOs.ListItemWithMeta>>, TagDTOs.FilterRequest>({
      query: (filterData) => ({
        url: ApiUrl.TAG_MY.toString(),
        params: filterData,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Tag' as const, id })),
              { type: 'Tag', id: 'LIST' }
            ]
          : [{ type: 'Tag', id: 'LIST' }],
    }),
    listMyActiveTags: build.query<ApiResponse<PagedResponse<TagDTOs.ListItem>>, TagDTOs.FilterRequest>({
      query: (filterData) => ({
        url: ApiUrl.TAG_MY_ACTIVE.toString(),
        params: filterData,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({ type: 'Tag' as const, id })),
              { type: 'Tag', id: 'LIST' }
            ]
          : [{ type: 'Tag', id: 'LIST' }],
    }),
    getTransactionsByTag: build.query<
      ApiResponse<TagDTOs.TransactionPagedResponse>,
      { tagId: number; pageData?: TagDTOs.TransactionFilterRequest }
    >({
      query: ({ tagId, pageData = { pageNumber: 0, pageSize: 10 } }) => ({
        url: `${ApiUrl.TRANSACTION_TAG_ID}`.toString().replace('{id}', tagId.toString()),
        method: 'POST',
        body: pageData,
      }),
      providesTags: (result, _error, { tagId }) =>
        result
          ? [
              ...result.data.content.map(({ id }) => ({
                type: 'TagTransaction' as const,
                id,
              })),
              { type: 'TagTransaction', id: `TAG_${tagId}` },
            ]
          : [{ type: 'TagTransaction', id: `TAG_${tagId}` }],
    }),
    deleteMyTag: build.mutation<ApiResponse<{ id: number }>, number>({
      query: (id) => ({
        url: ApiUrl.TAG_MY_BY_ID.toString().replace('{id}', id.toString()),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Tag', id },
        { type: 'Tag', id: 'LIST' },
      ],
    }),
  }),
})

export const { useListMyTagsQuery, useListMyActiveTagsQuery, useGetTransactionsByTagQuery, useDeleteMyTagMutation } = tagApi
