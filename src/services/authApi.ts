import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'

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
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (build) => ({
    login: build.mutation<ApiResponseLoginResponseDto, LoginRequestDto>({
      query: (body) => ({
        url: ApiUrl.AUTH_LOGIN.toString(),
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<{ type: boolean; message: string; timestamp: string; data?: unknown }, RegisterRequestDto>({
      query: (body) => ({
        url: ApiUrl.AUTH_REGISTER.toString(),
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi


