import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
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
        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/admin" label="Dashboard" />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-bold text-text-primary">Cores</h1>
        </div>

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
                    <div className="flex items-center gap-1.5">
                      {/* Editar */}
                      <button
                        onClick={() => startEdit(color)}
                        title="Editar"
                        className="rounded-md border border-border p-1.5 text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      {/* Ativar/Desativar */}
                      <button
                        onClick={() => handleToggle(color.id)}
                        title={color.enabled ? 'Desativar' : 'Ativar'}
                        className={[
                          'rounded-md p-1.5 transition-colors',
                          color.enabled
                            ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70'
                            : 'border border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/70',
                        ].join(' ')}
                      >
                        {color.enabled ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                      {/* Excluir */}
                      <button
                        onClick={() => handleDelete(color.id)}
                        title="Excluir"
                        className="rounded-md border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
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