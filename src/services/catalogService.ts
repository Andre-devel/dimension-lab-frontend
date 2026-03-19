import api from './api'
import type { Material, Color } from '@/types/catalog'

export const materialService = {
  async listActive(): Promise<Material[]> {
    const { data } = await api.get<Material[]>('/api/v1/materials')
    return data
  },
  async listAll(): Promise<Material[]> {
    const { data } = await api.get<Material[]>('/api/v1/materials/all')
    return data
  },
  async create(name: string): Promise<Material> {
    const { data } = await api.post<Material>('/api/v1/materials', { name })
    return data
  },
  async toggle(id: string): Promise<Material> {
    const { data } = await api.patch<Material>(`/api/v1/materials/${id}/toggle`)
    return data
  },
}

export const colorService = {
  async listActive(): Promise<Color[]> {
    const { data } = await api.get<Color[]>('/api/v1/colors')
    return data
  },
  async listAll(): Promise<Color[]> {
    const { data } = await api.get<Color[]>('/api/v1/colors/all')
    return data
  },
  async create(name: string, hex: string): Promise<Color> {
    const { data } = await api.post<Color>('/api/v1/colors', { name, hex })
    return data
  },
  async toggle(id: string): Promise<Color> {
    const { data } = await api.patch<Color>(`/api/v1/colors/${id}/toggle`)
    return data
  },
}
