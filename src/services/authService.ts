import api from './api'
import type { User } from '@/types/user'

export const authService = {
  loginWithGoogle(): void {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<User>('/api/v1/auth/register', { name, email, password })
    return data
  },

  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<User>('/api/v1/auth/login', { email, password })
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/api/v1/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout')
  },

  async checkEmail(email: string): Promise<{ registered: boolean }> {
    const { data } = await api.get<{ registered: boolean }>('/api/v1/auth/check-email', { params: { email } })
    return data
  },

  async checkPhone(phone: string): Promise<{ registered: boolean }> {
    const { data } = await api.get<{ registered: boolean }>('/api/v1/auth/check-phone', { params: { phone } })
    return data
  },

  async updateProfile(name: string, phone: string): Promise<User> {
    const { data } = await api.patch<User>('/api/v1/auth/profile', { name, phone })
    return data
  },
}
