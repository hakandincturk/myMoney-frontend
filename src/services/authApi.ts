import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { AuthDTOs, CommonTypes } from '../types'

type ApiResponse<T> = CommonTypes.ApiResponse<T>

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Sessions'],
  endpoints: (build) => ({
    login: build.mutation<ApiResponse<AuthDTOs.LoginResponse>, AuthDTOs.LoginRequest>({
      query: (body) => ({
        url: ApiUrl.AUTH_LOGIN.toString(),
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<ApiResponse<any>, AuthDTOs.RegisterRequest>({
      query: (body) => ({
        url: ApiUrl.AUTH_REGISTER.toString(),
        method: 'POST',
        body,
      }),
    }),
    me: build.query<ApiResponse<AuthDTOs.Me>, void>({
      query: () => ApiUrl.AUTH_ME.toString(),
      providesTags: ['Auth'],
    }),
    logout: build.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: ApiUrl.AUTH_LOGOUT.toString(),
        method: 'POST',
      }),
    }),
    sessions: build.query<ApiResponse<AuthDTOs.Session[]>, void>({
      query: () => ApiUrl.AUTH_SESSIONS.toString(),
      providesTags: ['Sessions'],
    }),
    revokeSession: build.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: ApiUrl.AUTH_SESSION_BY_ID.toString().replace('{id}', String(id)),
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),
    revokeOtherSessions: build.mutation<ApiResponse<AuthDTOs.RevokeSessionsResponse>, void>({
      query: () => ({
        url: ApiUrl.AUTH_SESSIONS.toString(),
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation,
  useSessionsQuery,
  useRevokeSessionMutation,
  useRevokeOtherSessionsMutation,
} = authApi
