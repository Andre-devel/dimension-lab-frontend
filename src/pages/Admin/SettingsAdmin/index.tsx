import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
import { settingsService, type SiteSettings } from '@/services/settingsService'

const INLINE_KEYS = ['whatsapp_url', 'instagram_url', 'youtube_url', 'whatsapp_admin_number', 'bot_number']

const SETTING_LABELS: Record<string, string> = {
  whatsapp_url: 'WhatsApp URL',
  instagram_url: 'Instagram URL',
  youtube_url: 'YouTube URL',
  whatsapp_admin_number: 'Número WhatsApp do Admin',
  bot_number: 'Número do Bot (WhatsApp)',
  gemini_image_prompt: 'Prompt IA (Gemini)',
}

const SETTING_DESCRIPTIONS: Record<string, string> = {
  whatsapp_url: 'Link do WhatsApp exibido no site.',
  instagram_url: 'Link do Instagram exibido no site.',
  youtube_url: 'Link do YouTube exibido no site.',
  whatsapp_admin_number: 'Número que recebe notificações de novos orçamentos (ex: 5511999999999).',
  bot_number: 'Número do bot conectado à Evolution API — usado no link "Falar via WhatsApp" do portfólio (ex: 5511999999999).',
  gemini_image_prompt: 'Instrução enviada ao Gemini para padronizar o fundo das fotos do portfólio.',
}

const EMPTY_SETTINGS: SiteSettings = {
  whatsapp_url: '',
  instagram_url: '',
  youtube_url: '',
  whatsapp_admin_number: '',
  bot_number: '',
  gemini_image_prompt: '',
}

export default function SettingsAdmin() {
  const [values, setValues] = useState<SiteSettings>(EMPTY_SETTINGS)
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

  const fieldClass =
    'flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors'
  const saveButtonClass =
    'rounded-md bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90 transition-colors'

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/admin" label="Dashboard" />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-bold text-text-primary">Configurações</h1>
        </div>
        <p className="text-text-secondary text-sm mb-8">
          Configurações gerais do site.
        </p>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {INLINE_KEYS.map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  {SETTING_LABELS[key]}
                </label>
                {SETTING_DESCRIPTIONS[key] && (
                  <p className="text-xs text-text-secondary mb-2 opacity-70">{SETTING_DESCRIPTIONS[key]}</p>
                )}
                <div className="flex gap-3">
                  <input
                    type={key === 'whatsapp_admin_number' || key === 'bot_number' ? 'tel' : 'url'}
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={key === 'whatsapp_admin_number' || key === 'bot_number' ? '5511999999999' : 'https://...'}
                    className={fieldClass}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave(key)}
                  />
                  <button onClick={() => handleSave(key)} className={saveButtonClass}>
                    Salvar
                  </button>
                </div>
                {saved === key && (
                  <p className="mt-1.5 text-xs text-green-400">Salvo com sucesso.</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                {SETTING_LABELS.gemini_image_prompt}
              </label>
              <p className="text-xs text-text-secondary mb-2 opacity-70">
                {SETTING_DESCRIPTIONS.gemini_image_prompt}
              </p>
              <textarea
                value={values.gemini_image_prompt ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, gemini_image_prompt: e.target.value }))}
                rows={4}
                placeholder="Ex: Remove the background and replace with a clean white studio background..."
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                {saved === 'gemini_image_prompt' ? (
                  <p className="text-xs text-green-400">Salvo com sucesso.</p>
                ) : (
                  <span />
                )}
                <button onClick={() => handleSave('gemini_image_prompt')} className={saveButtonClass}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
