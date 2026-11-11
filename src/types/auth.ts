// Auth and session DTOs (backend: /auth/*). The session token itself never reaches JS: it lives in an HttpOnly cookie.
export namespace AuthDTOs {
  export type LoginRequest = {
    email: string
    password: string
  }

  export type RegisterRequest = {
    fullName: string
    email: string
    password: string
    phone: string
  }

  export type LoginResponse = {
    fullName: string
    email: string
  }

  export type Me = {
    id: number
    fullName: string
    email: string
  }

  export type Session = {
    id: number
    deviceLabel: string
    ipAddress: string | null
    country: string | null
    createdAt: string
    lastSeenAt: string
    current: boolean
  }

  export type RevokeSessionsResponse = {
    revokedCount: number
  }
}
