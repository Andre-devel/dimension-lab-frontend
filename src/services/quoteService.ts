import api from './api'
import type { Quote, CreateQuotePayload } from '@/types/quote'

export const quoteService = {
  async create(payload: CreateQuotePayload): Promise<Quote> {
    const form = new FormData()
    form.append('description',     payload.description)
    form.append('material',        payload.material)
    form.append('color',           payload.color)
    form.append('quantity',        String(payload.quantity))
    form.append('finish',          payload.finish)
    form.append('desiredDeadline', payload.desiredDeadline)
    if (payload.customerName)      form.append('customerName',      payload.customerName)
    if (payload.customerEmail)     form.append('customerEmail',     payload.customerEmail)
    if (payload.customerWhatsapp)  form.append('customerWhatsapp',  payload.customerWhatsapp)
    payload.files.forEach((file) => form.append('files', file))

    const { data } = await api.post<Quote>('/api/v1/quotes', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async listMine(): Promise<Quote[]> {
    const { data } = await api.get<Quote[]>('/api/v1/quotes/my')
    return data
  },

  async listAll(): Promise<Quote[]> {
    const { data } = await api.get<Quote[]>('/api/v1/quotes')
    return data
  },

  async updateStatus(id: string, status: string): Promise<Quote> {
    const { data } = await api.patch<Quote>(`/api/v1/quotes/${id}/status`, { status })
    return data
  },
}
