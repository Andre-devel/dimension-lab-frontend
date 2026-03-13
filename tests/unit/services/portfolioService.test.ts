import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
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
  printTime: null,
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

  describe('listAll', () => {
    it('returns all items including hidden', async () => {
      const hidden = { ...mockItem, visible: false }
      mockedApi.get = vi.fn().mockResolvedValue({ data: [mockItem, hidden] })
      const result = await portfolioService.listAll()
      expect(result).toHaveLength(2)
      expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/portfolio-items/all')
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

  describe('create', () => {
    it('posts to portfolio-items and returns created item', async () => {
      mockedApi.post = vi.fn().mockResolvedValue({ data: mockItem })
      const formData = {
        title: 'Test Item',
        category: { name: 'Geral', slug: 'geral' },
        material: 'PLA',
        photos: [],
      }
      const result = await portfolioService.create(formData)
      expect(result).toEqual(mockItem)
      expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/portfolio-items', formData)
    })
  })

  describe('update', () => {
    it('puts to portfolio-items/:id and returns updated item', async () => {
      mockedApi.put = vi.fn().mockResolvedValue({ data: mockItem })
      const formData = {
        title: 'Updated',
        category: { name: 'Geral', slug: 'geral' },
        material: 'PETG',
        photos: [],
      }
      const result = await portfolioService.update('item-1', formData)
      expect(result).toEqual(mockItem)
      expect(mockedApi.put).toHaveBeenCalledWith('/api/v1/portfolio-items/item-1', formData)
    })
  })

  describe('remove', () => {
    it('deletes portfolio-items/:id', async () => {
      mockedApi.delete = vi.fn().mockResolvedValue({})
      await portfolioService.remove('item-1')
      expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/portfolio-items/item-1')
    })
  })

  describe('toggleVisibility', () => {
    it('patches visibility and returns updated item', async () => {
      const hidden = { ...mockItem, visible: false }
      mockedApi.patch = vi.fn().mockResolvedValue({ data: hidden })
      const result = await portfolioService.toggleVisibility('item-1', false)
      expect(result.visible).toBe(false)
      expect(mockedApi.patch).toHaveBeenCalledWith(
        '/api/v1/portfolio-items/item-1/visibility',
        { visible: false }
      )
    })
  })
})