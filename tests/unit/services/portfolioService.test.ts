import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/services/api'
import { portfolioService } from '@/services/portfolioService'

const mockedApi = vi.mocked(api)

const mockItem = {
  id: 'item-1',
  title: 'Test Item',
  category: { id: 'cat-1', name: 'Geral', slug: 'geral' },
  material: 'PLA',
  printTime: '4h',
  complexity: 'Médio',
  photos: [],
  visible: true,
}

describe('portfolioService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('list', () => {
    it('returns an array of portfolio items', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: [mockItem] })
      const result = await portfolioService.list()
      expect(result).toEqual([mockItem])
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/portfolio-items')
    })
  })

  describe('getById', () => {
    it('returns a portfolio item by id', async () => {
      mockedApi.get = vi.fn().mockResolvedValue({ data: mockItem })
      const result = await portfolioService.getById('item-1')
      expect(result.id).toBe('item-1')
      expect(result.title).toBe('Test Item')
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/portfolio-items/item-1')
    })
  })
})
