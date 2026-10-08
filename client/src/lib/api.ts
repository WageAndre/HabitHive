import axios from 'axios'
import type { ApiErrorBody } from '../types'

export const TOKEN_KEY = 'habithive_token'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'The request took too long.' : fallback)
  }
  return error instanceof Error ? error.message : fallback
}

