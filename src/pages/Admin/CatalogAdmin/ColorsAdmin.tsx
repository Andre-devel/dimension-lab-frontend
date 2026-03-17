import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { colorService } from '@/services/catalogService'
import type { Color } from '@/types/catalog'

export default function ColorsAdmin() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    colorService
      .listAll()
      .then(setColors)
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const created = await colorService.create(newName.trim())
      setColors((prev) => [...prev, created])
      setNewName('')
    } catch {
      setError('Erro ao criar cor.')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(id: string) {
    try {
      const updated = await colorService.toggle(id)
      setColors((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch {
      setError('Erro ao atualizar cor.')
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Cores</h1>

        {/* Create form */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome da cor"
            className="flex-1 rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="rounded-md bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {colors.map((color) => (
              <li
                key={color.id}
                className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-text-primary font-medium">{color.name}</span>
                  <span
                    className={[
                      'rounded-badge px-2 py-0.5 text-xs font-medium',
                      color.enabled
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400',
                    ].join(' ')}
                  >
                    {color.enabled ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(color.id)}
                  className={[
                    'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    color.enabled
                      ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70'
                      : 'border border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/70',
                  ].join(' ')}
                >
                  {color.enabled ? 'Desativar' : 'Ativar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  )
}
