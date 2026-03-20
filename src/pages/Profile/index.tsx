import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setWhatsapp] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    setError('')
    try {
      const updated = await authService.updateProfile(name.trim(), phone.trim())
      setUser({ ...updated, role: user!.role })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch {
      setError('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-text-primary mb-8">Meu Perfil</h1>

        <div className="flex flex-col gap-5">
          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-secondary cursor-not-allowed outline-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 11999999999"
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-400">Salvo com sucesso.</p>}

          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="rounded-md bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
