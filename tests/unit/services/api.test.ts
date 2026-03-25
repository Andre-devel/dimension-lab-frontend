import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Capture the response interceptor registered on the axios instance
const interceptorError = vi.fn()

vi.mock('@/store/authStore', () => ({
  useAuthStore: Object.assign(
    vi.fn().mockReturnValue({ isAuthenticated: true, clearUser: vi.fn() }),
    { getState: vi.fn().mockReturnValue({ isAuthenticated: true, clearUser: vi.fn() }) },
  ),
}))

vi.mock('@/store/toastStore', () => ({
  useToastStore: Object.assign(
    vi.fn().mockReturnValue({ show: vi.fn() }),
    { getState: vi.fn().mockReturnValue({ show: vi.fn() }) },
  ),
}))

vi.mock('axios', () => {
  const instance = {
    interceptors: {
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          interceptorError.mockImplementation(onRejected)
        }),
      },
    },
  }
  return {
    default: {
      create: vi.fn(() => instance),
    },
  }
})

describe('api interceptor', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // jsdom does not allow direct reassignment of window.location.href
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost:5173/' },
    })
    // Re-import to trigger interceptor registration
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
    vi.clearAllMocks()
  })

  it('redirects to / on 401 from non-auth endpoints', async () => {
    const { default: axiosMock } = await import('axios')
    await import('@/services/api')

    const error = { response: { status: 401 }, config: { url: '/api/v1/quotes' } }
    try { await interceptorError(error) } catch { /* expected */ }

    expect(window.location.href).toBe('/')
  })

  it('does NOT redirect on 401 from /auth/me', async () => {
    await import('@/services/api')

    const error = { response: { status: 401 }, config: { url: '/api/v1/auth/me' } }
    try { await interceptorError(error) } catch { /* expected */ }

    expect(window.location.href).not.toBe('/')
  })

  it('does not redirect on non-401 errors', async () => {
    await import('@/services/api')

    const error = { response: { status: 500 }, config: { url: '/api/v1/quotes' } }
    try { await interceptorError(error) } catch { /* expected */ }

    expect(window.location.href).not.toBe('/')
  })
})