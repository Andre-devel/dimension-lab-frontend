import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

import api from '@/services/api'
import { settingsService } from '@/services/settingsService'

const mockedApi = vi.mocked(api)

describe('settingsService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('getAll calls GET /api/v1/settings', async () => {
    const mockData = { whatsapp_url: 'https://wa.me/123', instagram_url: '', youtube_url: '' }
    mockedApi.get = vi.fn().mockResolvedValue({ data: mockData })

    const result = await settingsService.getAll()

    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/settings')
    expect(result.whatsapp_url).toBe('https://wa.me/123')
  })

  it('update calls PUT /api/v1/settings/:key', async () => {
    mockedApi.put = vi.fn().mockResolvedValue({ data: { key: 'whatsapp_url', value: 'https://wa.me/999' } })

    const result = await settingsService.update('whatsapp_url', 'https://wa.me/999')

    expect(mockedApi.put).toHaveBeenCalledWith('/api/v1/settings/whatsapp_url', { value: 'https://wa.me/999' })
    expect(result.value).toBe('https://wa.me/999')
  })
})
