import api from './api'

export interface SiteSettings {
  whatsapp_url: string
  instagram_url: string
  youtube_url: string
  whatsapp_admin_number: string
  bot_number: string
  gemini_image_prompt: string
  [key: string]: string
}

export const settingsService = {
  async getAll(): Promise<SiteSettings> {
    const { data } = await api.get<SiteSettings>('/api/v1/settings')
    return data
  },
  async update(key: string, value: string): Promise<{ key: string; value: string }> {
    const { data } = await api.put<{ key: string; value: string }>(`/api/v1/settings/${key}`, { value })
    return data
  },
}
