// lib/auth.ts
"use client"

interface UserData {
  _id: string
  email: string
  name: string
  photo: string
  role: string
  id: string
}

interface AuthData {
  token: string
  user: UserData
}

const TOKEN_KEY = "auth_token"
const USER_KEY = "auth_user"

export const setAuthData = (data: AuthData) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  }
}

export const getAuthData = (): AuthData | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY)
    const userString = localStorage.getItem(USER_KEY)
    if (token && userString) {
      try {
        const user = JSON.parse(userString)
        return { token, user }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error)
        return null
      }
    }
  }
  return null
}

export const removeAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}

export const isAuthenticated = (): boolean => {
  return typeof window !== "undefined" && localStorage.getItem(TOKEN_KEY) !== null
}
