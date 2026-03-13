import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSeenStatuses,
  saveSeenStatuses,
  getUpdatedQuoteIds,
} from '@/utils/quoteNotifications'
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

describe('quoteNotifications', () => {
  beforeEach(() => localStorage.clear())

  describe('getSeenStatuses', () => {
    it('returns empty object when nothing stored', () => {
      expect(getSeenStatuses('user-1')).toEqual({})
    })

    it('returns stored statuses for the user', () => {
      localStorage.setItem('quote-statuses-user-1', JSON.stringify({ 'q-1': 'RECEIVED' }))
      expect(getSeenStatuses('user-1')).toEqual({ 'q-1': 'RECEIVED' })
    })

    it('returns empty object when stored value is invalid JSON', () => {
      localStorage.setItem('quote-statuses-user-1', 'invalid')
      expect(getSeenStatuses('user-1')).toEqual({})
    })
  })

  describe('saveSeenStatuses', () => {
    it('persists the current statuses for the user', () => {
      const quotes = [makeQuote('q-1', 'RECEIVED'), makeQuote('q-2', 'PRINTING')]
      saveSeenStatuses('user-1', quotes)
      const stored = JSON.parse(localStorage.getItem('quote-statuses-user-1')!)
      expect(stored).toEqual({ 'q-1': 'RECEIVED', 'q-2': 'PRINTING' })
    })
  })

  describe('getUpdatedQuoteIds', () => {
    it('returns empty set when no previous data', () => {
      const quotes = [makeQuote('q-1', 'RECEIVED')]
      const result = getUpdatedQuoteIds('user-1', quotes)
      expect(result.size).toBe(0)
    })

    it('returns IDs of quotes whose status changed since last visit', () => {
      localStorage.setItem(
        'quote-statuses-user-1',
        JSON.stringify({ 'q-1': 'RECEIVED', 'q-2': 'RECEIVED' }),
      )
      const quotes = [makeQuote('q-1', 'UNDER_REVIEW'), makeQuote('q-2', 'RECEIVED')]
      const result = getUpdatedQuoteIds('user-1', quotes)
      expect(result.has('q-1')).toBe(true)
      expect(result.has('q-2')).toBe(false)
    })

    it('does not flag new quotes (no previous entry)', () => {
      localStorage.setItem('quote-statuses-user-1', JSON.stringify({ 'q-1': 'RECEIVED' }))
      const quotes = [makeQuote('q-1', 'RECEIVED'), makeQuote('q-2', 'PRINTING')]
      const result = getUpdatedQuoteIds('user-1', quotes)
      expect(result.has('q-2')).toBe(false)
    })
  })
})