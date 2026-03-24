import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

const labelStyle = { fontSize: '10px', letterSpacing: '0.1em', color: 'rgb(var(--c-text-secondary))' } as const

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const [name, setName]   = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

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
      <div className="mx-auto max-w-lg px-4 py-12">

        <div className="mb-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-widest mb-1">Conta</p>
          <h1 className="text-2xl font-bold text-text-primary">Meu Perfil</h1>
        </div>

        <div className="rounded-2xl p-8 flex flex-col gap-6"
             style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>

          <div className="h-px" style={{ background: 'var(--glow-separator)', opacity: 0.18 }} />

          {/* E-mail — somente leitura */}
          <div>
            <label className="block font-mono uppercase mb-2" style={labelStyle}>
              E-mail
              <span className="ml-2 normal-case tracking-normal"
                    style={{ fontSize: '9px', color: 'rgb(var(--c-accent-blue) / 0.4)' }}>
                somente leitura
              </span>
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              readOnly
              className="q-input w-full rounded-xl px-4 py-3 text-sm text-text-secondary outline-none opacity-50 cursor-not-allowed"
              style={{ fontFamily: 'inherit', pointerEvents: 'none' }}
            />
          </div>

          {/* Nome */}
          <div>
            <label className="block font-mono uppercase mb-2" style={labelStyle}>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="name"
              className="q-input w-full rounded-xl px-4 py-3 text-sm text-text-primary outline-none placeholder:text-border"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block font-mono uppercase mb-2" style={labelStyle}>Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 11999999999"
              autoComplete="tel"
              className="q-input w-full rounded-xl px-4 py-3 text-sm text-text-primary outline-none placeholder:text-border"
              style={{ fontFamily: 'inherit' }}
            />
          </div>

          <div className="h-px bg-border/20" />

          {error && (
            <div className="rounded-xl px-4 py-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl px-4 py-3 text-xs text-emerald-400 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20">
              <span>✓</span> Perfil salvo com sucesso.
            </div>
          )}

          <button onClick={handleSave} disabled={saving || !name.trim()} className="q-submit-btn">
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </PageWrapper>
  )
}
