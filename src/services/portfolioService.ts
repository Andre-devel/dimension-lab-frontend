import api from './api'
import type { PortfolioItem } from '@/types/portfolio'

export interface PortfolioItemFormData {
  title: string
  category: { id?: string; name: string; slug: string }
  material: string
  printTime?: number | null
  complexity?: string
  photos: string[]
  modelFile?: string
}

export const portfolioService = {
  async list(): Promise<PortfolioItem[]> {
    const { data } = await api.get<PortfolioItem[]>('/api/v1/portfolio-items')
    return data
  },

  async listAll(): Promise<PortfolioItem[]> {
    const { data } = await api.get<PortfolioItem[]>('/api/v1/portfolio-items/all')
    return data
  },

  async getById(id: string): Promise<PortfolioItem> {
    const { data } = await api.get<PortfolioItem>(`/api/v1/portfolio-items/${id}`)
    return data
  },

  async create(formData: PortfolioItemFormData): Promise<PortfolioItem> {
    const { data } = await api.post<PortfolioItem>('/api/v1/portfolio-items', formData)
    return data
  },

  async update(id: string, formData: PortfolioItemFormData): Promise<PortfolioItem> {
    const { data } = await api.put<PortfolioItem>(`/api/v1/portfolio-items/${id}`, formData)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/v1/portfolio-items/${id}`)
  },

  async toggleVisibility(id: string, visible: boolean): Promise<PortfolioItem> {
    const { data } = await api.patch<PortfolioItem>(
      `/api/v1/portfolio-items/${id}/visibility`,
      { visible }
    )
    return data
  },
}