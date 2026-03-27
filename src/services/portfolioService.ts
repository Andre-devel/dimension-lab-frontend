import api from './api'
import type { PortfolioItem } from '@/types/portfolio'

export interface PortfolioItemFormData {
  title: string
  categoryName: string
  material: string
  printTime?: number | null
  complexity?: string
  photos?: File[]
  modelFile?: File | null
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
    const fd = buildFormData(formData)
    const { data } = await api.post<PortfolioItem>('/api/v1/portfolio-items', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async update(id: string, formData: PortfolioItemFormData): Promise<PortfolioItem> {
    const fd = buildFormData(formData)
    const { data } = await api.put<PortfolioItem>(`/api/v1/portfolio-items/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
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

  async standardizeImage(file: File): Promise<{ imageBase64: string; mimeType: string }> {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post<{ imageBase64: string; mimeType: string }>(
      '/api/v1/portfolio-items/standardize-image',
      fd,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },
}

function buildFormData(formData: PortfolioItemFormData): FormData {
  const fd = new FormData()
  fd.append('title', formData.title)
  fd.append('categoryName', formData.categoryName)
  fd.append('material', formData.material)
  if (formData.printTime != null) fd.append('printTime', String(formData.printTime))
  if (formData.complexity) fd.append('complexity', formData.complexity)
  if (formData.photos) {
    formData.photos.forEach((file) => fd.append('photos', file))
  }
  if (formData.modelFile) fd.append('modelFile', formData.modelFile)
  return fd
}