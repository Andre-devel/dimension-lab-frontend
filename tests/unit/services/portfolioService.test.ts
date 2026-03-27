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
    it('posts FormData to portfolio-items and returns created item', async () => {
      mockedApi.post = vi.fn().mockResolvedValue({ data: mockItem })
      const result = await portfolioService.create({
        title: 'Test Item',
        categoryName: 'Geral',
        material: 'PLA',
      })
      expect(result).toEqual(mockItem)
      const [url, body, config] = vi.mocked(mockedApi.post).mock.calls[0]
      expect(url).toBe('/api/v1/portfolio-items')
      expect(body).toBeInstanceOf(FormData)
      expect(config?.headers?.['Content-Type']).toBe('multipart/form-data')
    })
  })

  describe('update', () => {
    it('puts FormData to portfolio-items/:id and returns updated item', async () => {
      mockedApi.put = vi.fn().mockResolvedValue({ data: mockItem })
      const result = await portfolioService.update('item-1', {
        title: 'Updated',
        categoryName: 'Geral',
        material: 'PETG',
      })
      expect(result).toEqual(mockItem)
      const [url, body] = vi.mocked(mockedApi.put).mock.calls[0]
      expect(url).toBe('/api/v1/portfolio-items/item-1')
      expect(body).toBeInstanceOf(FormData)
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

  describe('standardizeImage', () => {
    it('posts file as FormData and returns base64 response', async () => {
      const response = { imageBase64: 'abc123base64', mimeType: 'image/jpeg' }
      mockedApi.post = vi.fn().mockResolvedValue({ data: response })
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

      const result = await portfolioService.standardizeImage(file)

      expect(result).toEqual(response)
      const [url, body, config] = vi.mocked(mockedApi.post).mock.calls[0]
      expect(url).toBe('/api/v1/portfolio-items/standardize-image')
      expect(body).toBeInstanceOf(FormData)
      expect(config?.headers?.['Content-Type']).toBe('multipart/form-data')
    })

    it('rejects when API call fails', async () => {
      mockedApi.post = vi.fn().mockRejectedValue(new Error('Network error'))
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

      await expect(portfolioService.standardizeImage(file)).rejects.toThrow('Network error')
    })
  })
})