import { renderHook } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/utils/quoteNotifications', () => ({
  getUpdatedQuoteIds: vi.fn(),
  saveSeenStatuses: vi.fn(),
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

import { getUpdatedQuoteIds, saveSeenStatuses } from '@/utils/quoteNotifications'
import { useAuthStore } from '@/store/authStore'
import { useQuoteNotifications } from '@/hooks/useQuoteNotifications'
import type { Quote } from '@/types/quote'

const makeQuote = (id: string, status: Quote['status']): Quote => ({
  id,
  description: 'test',
  material: 'PLA',
  color: 'Blue',
  quantity: 1,
  finish: 'Padrão',
  desiredDeadline: '2026-04-01',
  status,
  createdAt: '2026-03-01T00:00:00Z',
  files: [],
})

describe('useQuoteNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue({ user: { id: 'user-1', email: 'a@b.com', role: 'CLIENT' } } as ReturnType<typeof useAuthStore>)
  })

  it('returns updatedIds from getUpdatedQuoteIds', () => {
    const updatedSet = new Set(['q-1'])
    vi.mocked(getUpdatedQuoteIds).mockReturnValue(updatedSet)
    const quotes = [makeQuote('q-1', 'UNDER_REVIEW')]

    const { result } = renderHook(() => useQuoteNotifications(quotes))

    expect(result.current.updatedIds).toBe(updatedSet)
  })

  it('calls saveSeenStatuses with userId and quotes', () => {
    vi.mocked(getUpdatedQuoteIds).mockReturnValue(new Set())
    const quotes = [makeQuote('q-1', 'RECEIVED')]

    renderHook(() => useQuoteNotifications(quotes))

    expect(saveSeenStatuses).toHaveBeenCalledWith('user-1', quotes)
  })

  it('returns empty set when user is null', () => {
    vi.mocked(useAuthStore).mockReturnValue({ user: null } as ReturnType<typeof useAuthStore>)
    const quotes = [makeQuote('q-1', 'RECEIVED')]

    const { result } = renderHook(() => useQuoteNotifications(quotes))

    expect(result.current.updatedIds.size).toBe(0)
  })
})