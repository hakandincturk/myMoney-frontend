import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

type LoginRequestDto = {
  email: string
  password: string
}

type RegisterRequestDto = {
  fullName: string
  email: string
  password: string
  phone: string
}

type ApiResponseLoginResponseDto = {
  type: boolean
  message: string
  timestamp: string
  data: { token: string }
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (build) => ({
    login: build.mutation<ApiResponseLoginResponseDto, LoginRequestDto>({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<{ type: boolean; message: string; timestamp: string; data?: unknown }, RegisterRequestDto>({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi


