import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { settingsService, type SiteSettings } from '@/services/settingsService'

const SETTING_LABELS: Record<string, string> = {
  whatsapp_url: 'WhatsApp URL',
  instagram_url: 'Instagram URL',
  youtube_url: 'YouTube URL',
}

const SETTING_KEYS = ['whatsapp_url', 'instagram_url', 'youtube_url']

export default function SettingsAdmin() {
  const [values, setValues] = useState<SiteSettings>({ whatsapp_url: '', instagram_url: '', youtube_url: '' })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    settingsService
      .getAll()
      .then(setValues)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(key: string) {
    setError('')
    setSaved(null)
    try {
      await settingsService.update(key, values[key] ?? '')
      setSaved(key)
      setTimeout(() => setSaved(null), 2500)
    } catch {
      setError(`Erro ao salvar ${SETTING_LABELS[key] ?? key}.`)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Configurações</h1>
        <p className="text-text-secondary text-sm mb-8">
          Links exibidos no site. Deixe em branco para ocultar.
        </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {SETTING_KEYS.map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {SETTING_LABELS[key]}
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`https://...`}
                    className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(key)}
                  />
                  <button
                    onClick={() => handleSave(key)}
                    className="rounded-md bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
                {saved === key && (
                  <p className="mt-1.5 text-xs text-green-400">Salvo com sucesso.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
