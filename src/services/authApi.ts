import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseApi'
import { ApiUrl } from '../config/ApiUrl'
import { CommonTypes } from '../types'

// Kısa alias'lar oluştur
type ApiResponse<T> = CommonTypes.ApiResponse<T>

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

type LoginResponseDto = {
  token: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (build) => ({
    login: build.mutation<ApiResponse<LoginResponseDto>, LoginRequestDto>({
      query: (body) => ({
        url: ApiUrl.AUTH_LOGIN.toString(),
        method: 'POST',
        body,
      }),
    }),
    register: build.mutation<ApiResponse<any>, RegisterRequestDto>({
      query: (body) => ({
        url: ApiUrl.AUTH_REGISTER.toString(),
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi


