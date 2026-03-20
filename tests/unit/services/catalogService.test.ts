import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '@/services/api'
import { materialService, colorService } from '@/services/catalogService'

const mockedApi = vi.mocked(api)

describe('materialService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listActive calls GET /api/v1/materials', async () => {
    mockedApi.get = vi.fn().mockResolvedValue({ data: [] })
    await materialService.listActive()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/materials')
  })

  it('listAll calls GET /api/v1/materials/all', async () => {
    mockedApi.get = vi.fn().mockResolvedValue({ data: [] })
    await materialService.listAll()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/materials/all')
  })

  it('create calls POST /api/v1/materials', async () => {
    mockedApi.post = vi.fn().mockResolvedValue({ data: { id: '1', name: 'PLA', enabled: true } })
    const result = await materialService.create('PLA')
    expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/materials', { name: 'PLA' })
    expect(result.name).toBe('PLA')
  })

  it('toggle calls PATCH /api/v1/materials/:id/toggle', async () => {
    mockedApi.patch = vi.fn().mockResolvedValue({ data: { id: '1', name: 'PLA', enabled: false } })
    const result = await materialService.toggle('1')
    expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/materials/1/toggle')
    expect(result.enabled).toBe(false)
  })

  it('update calls PUT /api/v1/materials/:id', async () => {
    mockedApi.put = vi.fn().mockResolvedValue({ data: { id: '1', name: 'PLA+', enabled: true } })
    const result = await materialService.update('1', 'PLA+')
    expect(mockedApi.put).toHaveBeenCalledWith('/api/v1/materials/1', { name: 'PLA+' })
    expect(result.name).toBe('PLA+')
  })

  it('remove calls DELETE /api/v1/materials/:id', async () => {
    mockedApi.delete = vi.fn().mockResolvedValue({})
    await materialService.remove('1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/materials/1')
  })
})

describe('colorService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listActive calls GET /api/v1/colors', async () => {
    mockedApi.get = vi.fn().mockResolvedValue({ data: [] })
    await colorService.listActive()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/colors')
  })

  it('listAll calls GET /api/v1/colors/all', async () => {
    mockedApi.get = vi.fn().mockResolvedValue({ data: [] })
    await colorService.listAll()
    expect(mockedApi.get).toHaveBeenCalledWith('/api/v1/colors/all')
  })

  it('create calls POST /api/v1/colors', async () => {
    mockedApi.post = vi.fn().mockResolvedValue({ data: { id: '1', name: 'Azul', hex: '#2563EB', enabled: true } })
    const result = await colorService.create('Azul', '#2563EB')
    expect(mockedApi.post).toHaveBeenCalledWith('/api/v1/colors', { name: 'Azul', hex: '#2563EB' })
    expect(result.name).toBe('Azul')
  })

  it('toggle calls PATCH /api/v1/colors/:id/toggle', async () => {
    mockedApi.patch = vi.fn().mockResolvedValue({ data: { id: '1', name: 'Azul', hex: '#2563EB', enabled: false } })
    const result = await colorService.toggle('1')
    expect(mockedApi.patch).toHaveBeenCalledWith('/api/v1/colors/1/toggle')
    expect(result.enabled).toBe(false)
  })

  it('update calls PUT /api/v1/colors/:id', async () => {
    mockedApi.put = vi.fn().mockResolvedValue({ data: { id: '1', name: 'Crimson', hex: '#DC143C', enabled: true } })
    const result = await colorService.update('1', 'Crimson', '#DC143C')
    expect(mockedApi.put).toHaveBeenCalledWith('/api/v1/colors/1', { name: 'Crimson', hex: '#DC143C' })
    expect(result.name).toBe('Crimson')
    expect(result.hex).toBe('#DC143C')
  })

  it('remove calls DELETE /api/v1/colors/:id', async () => {
    mockedApi.delete = vi.fn().mockResolvedValue({})
    await colorService.remove('1')
    expect(mockedApi.delete).toHaveBeenCalledWith('/api/v1/colors/1')
  })
})