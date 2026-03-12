import api from './api'
import type { User } from '@/types/user'

export const authService = {
  loginWithGoogle(): void {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/oauth2/authorization/google`
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/api/v1/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout')
  },
}
