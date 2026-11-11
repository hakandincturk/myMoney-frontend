import { RootState } from '@/store/store'

export const selectAuth = (state: RootState) => state.auth
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectUser = (state: RootState) => state.auth.user
