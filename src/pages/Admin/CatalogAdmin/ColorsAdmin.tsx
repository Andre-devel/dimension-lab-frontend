import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { colorService } from '@/services/catalogService'
import type { Color } from '@/types/catalog'

export default function ColorsAdmin() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newHex, setNewHex] = useState('#2563EB')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingHex, setEditingHex] = useState('')

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
      const created = await colorService.create(newName.trim(), newHex)
      setColors((prev) => [...prev, created])
      setNewName('')
      setNewHex('#2563EB')
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

  function startEdit(color: Color) {
    setEditingId(color.id)
    setEditingName(color.name)
    setEditingHex(color.hex)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
    setEditingHex('')
  }

  async function handleSave(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      const updated = await colorService.update(id, editingName.trim(), editingHex)
      setColors((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingId(null)
    } catch {
      setError('Erro ao editar cor.')
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      await colorService.remove(id)
      setColors((prev) => prev.filter((c) => c.id !== id))
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setError('Não é possível excluir: cor possui orçamentos vinculados.')
      } else {
        setError('Erro ao excluir cor.')
      }
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Cores</h1>

        {/* Create form */}
        <div className="mb-6 flex gap-3 items-center">
          {/* Color picker */}
          <label
            title="Escolher cor"
            style={{
              position: 'relative',
              width: 40,
              height: 40,
              borderRadius: 8,
              border: '2px solid rgba(56,189,248,.2)',
              background: newHex,
              cursor: 'pointer',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          </label>

          {/* Hex value display */}
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: '#8899aa',
              minWidth: 64,
              userSelect: 'all',
            }}
          >
            {newHex.toUpperCase()}
          </span>

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
                className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 gap-3"
              >
                {editingId === color.id ? (
                  /* Edit mode */
                  <div className="flex flex-1 items-center gap-2">
                    <label
                      title="Escolher cor"
                      style={{
                        position: 'relative',
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '2px solid rgba(56,189,248,.3)',
                        background: editingHex,
                        cursor: 'pointer',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <input
                        type="color"
                        value={editingHex}
                        onChange={(e) => setEditingHex(e.target.value)}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer',
                          border: 'none',
                          padding: 0,
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(color.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 rounded-md border border-accent-blue bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(color.id)}
                      disabled={!editingName.trim()}
                      className="rounded-md bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  /* View mode */
                  <>
                    <div className="flex items-center gap-3">
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          background: color.hex,
                          border: '1px solid rgba(255,255,255,.1)',
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                        title={color.hex}
                      />
                      <span className="text-text-primary font-medium">{color.name}</span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 11,
                          color: '#556677',
                        }}
                      >
                        {color.hex.toUpperCase()}
                      </span>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(color)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
                      >
                        Editar
                      </button>
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
                      <button
                        onClick={() => handleDelete(color.id)}
                        className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  )
}