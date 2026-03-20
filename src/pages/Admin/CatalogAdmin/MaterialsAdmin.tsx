import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { materialService } from '@/services/catalogService'
import type { Material } from '@/types/catalog'

export default function MaterialsAdmin() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    materialService
      .listAll()
      .then(setMaterials)
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const created = await materialService.create(newName.trim())
      setMaterials((prev) => [...prev, created])
      setNewName('')
    } catch {
      setError('Erro ao criar material.')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(id: string) {
    try {
      const updated = await materialService.toggle(id)
      setMaterials((prev) => prev.map((m) => (m.id === id ? updated : m)))
    } catch {
      setError('Erro ao atualizar material.')
    }
  }

  function startEdit(material: Material) {
    setEditingId(material.id)
    setEditingName(material.name)
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
  }

  async function handleSave(id: string) {
    if (!editingName.trim()) return
    setError('')
    try {
      const updated = await materialService.update(id, editingName.trim())
      setMaterials((prev) => prev.map((m) => (m.id === id ? updated : m)))
      setEditingId(null)
    } catch {
      setError('Erro ao editar material.')
    }
  }

  async function handleDelete(id: string) {
    setError('')
    try {
      await materialService.remove(id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setError('Não é possível excluir: material possui orçamentos vinculados.')
      } else {
        setError('Erro ao excluir material.')
      }
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Materiais</h1>

        {/* Create form */}
        <div className="mb-6 flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do material"
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
            {materials.map((material) => (
              <li
                key={material.id}
                className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 gap-3"
              >
                {editingId === material.id ? (
                  /* Edit mode */
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(material.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 rounded-md border border-accent-blue bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(material.id)}
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
                      <span className="text-text-primary font-medium">{material.name}</span>
                      <span
                        className={[
                          'rounded-badge px-2 py-0.5 text-xs font-medium',
                          material.enabled
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400',
                        ].join(' ')}
                      >
                        {material.enabled ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(material)}
                        className="rounded-md border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(material.id)}
                        className={[
                          'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                          material.enabled
                            ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70'
                            : 'border border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/70',
                        ].join(' ')}
                      >
                        {material.enabled ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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