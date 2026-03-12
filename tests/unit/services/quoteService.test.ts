import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'

vi.mock('@/services/api', () => ({
  default: {
    post: vi.fn(),
    get:  vi.fn(),
    patch: vi.fn(),
  },
}))

import api from '@/services/api'
import { quoteService } from '@/services/quoteService'

const mockedApi = vi.mocked(api)

const mockQuote = {
  id: 'quote-1',
  description: 'Test quote',
  material: 'PLA',
  color: 'white',
  quantity: 1,
  finish: 'Padrão',
  desiredDeadline: '2026-04-01',
  status: 'RECEIVED' as const,
  createdAt: '2026-03-11T00:00:00Z',
  files: [],
}

describe('quoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('sends a multipart POST and returns the created quote', async () => {
      mockedApi.post = vi.fn().mockResolvedValue({ data: mockQuote })

      const file = new File(['content'], 'model.stl', { type: 'model/stl' })
      const result = await quoteService.create({
        description: 'Test quote',
        material: 'PLA',
        color: 'white',
        quantity: 1,
        finish: 'Padrão',
        desiredDeadline: '2026-04-01',
        files: [file],
      })

      expect(result.id).toBe('quote-1')
      expect(result.status).toBe('RECEIVED')
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/v1/quotes',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
    })

    it('includes optional customer fields when provided', async () => {
      mockedApi.post = vi.fn().mockResolvedValue({ data: mockQuote })

      await quoteService.create({
        description: 'Test',
        material: 'PLA',
        color: 'white',
        quantity: 1,
        finish: 'Padrão',
        desiredDeadline: '2026-04-01',
        files: [],
        customerName: 'João',
        customerEmail: 'joao@test.com',
        customerWhatsapp: '11999999999',
      })

      const formData: FormData = (mockedApi.post as ReturnType<typeof vi.fn>).mock.calls[0][1]
      expect(formData.get('customerName')).toBe('João')
      expect(formData.get('customerEmail')).toBe('joao@test.com')
      expect(formData.get('customerWhatsapp')).toBe('11999999999')
    })

    it('throws when the server responds with an error', async () => {
      mockedApi.post = vi.fn().mockRejectedValue(new Error('Bad Request'))
      await expect(
        quoteService.create({ description: '', material: 'PLA', color: 'white', quantity: 1, finish: 'Padrão', desiredDeadline: '2026-04-01', files: [] }),
      ).rejects.toThrow('Bad Request')
    })
  })

  describe('listMine', () => {
    it('returns an array of quotes', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: [mockQuote] })
      const result = await quoteService.listMine()
      expect(result).toEqual([mockQuote])
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/quotes/my')
    })
  })

  describe('listAll', () => {
    it('returns an array of quotes', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: [] })
      const result = await quoteService.listAll()
      expect(Array.isArray(result)).toBe(true)
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/quotes')
    })
  })

  describe('updateStatus', () => {
    it('patches the status and returns the updated quote', async () => {
      const updated = { ...mockQuote, status: 'UNDER_REVIEW' as const }
      mockedApi.patch = vi.fn().mockResolvedValue({ data: updated })

      const result = await quoteService.updateStatus('quote-1', 'UNDER_REVIEW')
      expect(result.status).toBe('UNDER_REVIEW')
      expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/quotes/quote-1/status', { status: 'UNDER_REVIEW' })
    })
  })
})
