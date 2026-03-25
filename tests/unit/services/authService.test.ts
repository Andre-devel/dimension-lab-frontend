import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get:   vi.fn(),
    post:  vi.fn(),
    patch: vi.fn(),
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

  describe('register', () => {
    it('posts to register endpoint and returns user', async () => {
      const user = { id: 'u1', name: 'João', email: 'joao@test.com', role: 'CLIENT' as const }
      mockedApi.post = vi.fn().mockResolvedValue({ data: user })
      const result = await authService.register('João', 'joao@test.com', 'pass123')
      expect(result).toEqual(user)
      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/auth/register', { name: 'João', email: 'joao@test.com', password: 'pass123' })
    })
  })

  describe('login', () => {
    it('posts to login endpoint and returns user', async () => {
      const user = { id: 'u1', name: 'João', email: 'joao@test.com', role: 'CLIENT' as const }
      mockedApi.post = vi.fn().mockResolvedValue({ data: user })
      const result = await authService.login('joao@test.com', 'pass123')
      expect(result).toEqual(user)
      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/auth/login', { email: 'joao@test.com', password: 'pass123' })
    })
  })

  describe('checkEmail', () => {
    it('returns registered status', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: { registered: true } })
      const result = await authService.checkEmail('joao@test.com')
      expect(result).toEqual({ registered: true })
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/auth/check-email', { params: { email: 'joao@test.com' } })
    })
  })

  describe('checkPhone', () => {
    it('returns registered status', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: { registered: false } })
      const result = await authService.checkPhone('11999999999')
      expect(result).toEqual({ registered: false })
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/auth/check-phone', { params: { phone: '11999999999' } })
    })
  })

  describe('updateProfile', () => {
    it('patches profile and returns updated user', async () => {
      const user = { id: 'u1', name: 'João Silva', email: 'joao@test.com', role: 'CLIENT' as const }
      mockedApi.patch = vi.fn().mockResolvedValue({ data: user })
      const result = await authService.updateProfile('João Silva', '11999999999')
      expect(result).toEqual(user)
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/auth/profile', { name: 'João Silva', phone: '11999999999' })
    })
  })

  describe('loginWithGoogle', () => {
    it('sets window.location.href to google oauth url', () => {
      const location = { href: '' }
      vi.stubGlobal('location', location)
      authService.loginWithGoogle()
      expect(location.href).toContain('/oauth2/authorization/google')
      vi.unstubAllGlobals()
    })
  })
})
