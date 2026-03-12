import api from './api'
import type { PortfolioItem } from '@/types/portfolio'

export const portfolioService = {
  async list(): Promise<PortfolioItem[]> {
    const { data } = await api.get<PortfolioItem[]>('/api/v1/portfolio-items')
    return data
  },

  async getById(id: string): Promise<PortfolioItem> {
    const { data } = await api.get<PortfolioItem>(`/api/v1/portfolio-items/${id}`)
    return data
  },
}
