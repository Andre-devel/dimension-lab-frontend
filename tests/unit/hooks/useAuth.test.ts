import { renderHook, waitFor } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('@/services/authService', () => ({
  authService: {
    me: vi.fn(),
  },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  const setUser = vi.fn()
  const setAuthLoading = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({ setUser, setAuthLoading } as ReturnType<typeof useAuthStore>)
  })

  it('calls authService.me on mount', async () => {
    vi.mocked(authService.me).mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'CLIENT' })
    renderHook(() => useAuth())
    await waitFor(() => expect(authService.me).toHaveBeenCalledOnce())
  })

  it('calls setUser with user when me() succeeds', async () => {
    const user = { id: 'u1', email: 'a@b.com', role: 'CLIENT' as const }
    vi.mocked(authService.me).mockResolvedValue(user)
    renderHook(() => useAuth())
    await waitFor(() => expect(setUser).toHaveBeenCalledWith(user))
  })

  it('calls setAuthLoading(false) after me() succeeds', async () => {
    vi.mocked(authService.me).mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'CLIENT' })
    renderHook(() => useAuth())
    await waitFor(() => expect(setAuthLoading).toHaveBeenCalledWith(false))
  })

  it('does not call setUser when me() fails', async () => {
    vi.mocked(authService.me).mockRejectedValue(new Error('Unauthorized'))
    renderHook(() => useAuth())
    await waitFor(() => expect(setAuthLoading).toHaveBeenCalledWith(false))
    expect(setUser).not.toHaveBeenCalled()
  })

  it('calls setAuthLoading(false) even when me() fails', async () => {
    vi.mocked(authService.me).mockRejectedValue(new Error('Unauthorized'))
    renderHook(() => useAuth())
    await waitFor(() => expect(setAuthLoading).toHaveBeenCalledWith(false))
  })
})