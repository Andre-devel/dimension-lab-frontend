import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}))

import api from '@/services/api'
import { authService } from '@/services/authService'

const mockedApi = vi.mocked(api)

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('me', () => {
    it('returns the current user', async () => {
      const user = { id: 'user-1', name: 'Test User', email: 'test@test.com', role: 'CLIENT' as const }
      mockedApi.get = vi.fn().mockResolvedValue({ data: user })

      const result = await authService.me()
      expect(result.id).toBe('user-1')
      expect(result.role).toBe('CLIENT')
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/auth/me')
    })
  })

  describe('logout', () => {
    it('calls logout endpoint without error', async () => {
      mockedApi.post = vi.fn().mockResolvedValue({ data: null })
      await expect(authService.logout()).resolves.toBeUndefined()
      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/auth/logout')
    })
  })
})
