import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

export default function PortfolioAdmin() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioService
      .listAll()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(item: PortfolioItem) {
    const updated = await portfolioService.toggleVisibility(item.id, !item.visible)
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
  }

  async function handleDelete(item: PortfolioItem) {
    if (!window.confirm(`Excluir "${item.title}"?`)) return
    await portfolioService.remove(item.id)
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Gerenciar Portfólio</h1>
          <Link
            to="/admin/portfolio/new"
            className="rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Novo Item
          </Link>
        </div>

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-text-secondary">Nenhum item no portfólio.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-card bg-surface">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    {['Título', 'Categoria', 'Material', 'Status', 'Ações'].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.category.name}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.material}</td>
                      <td className="px-4 py-3">
                        {item.visible ? (
                          <span className="rounded-badge bg-accent-blue/20 px-2 py-0.5 text-xs font-medium text-accent-blue">
                            Visível
                          </span>
                        ) : (
                          <span className="rounded-badge bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-secondary">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/portfolio/${item.id}/edit`}
                            className="text-sm font-medium text-accent-blue hover:underline"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggle(item)}
                            title={item.visible ? 'Ocultar' : 'Exibir'}
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                          >
                            {item.visible ? 'Ocultar' : 'Exibir'}
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Excluir"
                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="flex flex-col gap-4 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-card bg-surface p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text-primary">{item.title}</p>
                      <p className="text-sm text-text-secondary">
                        {item.category.name} · {item.material}
                      </p>
                    </div>
                    {item.visible ? (
                      <span className="rounded-badge bg-accent-blue/20 px-2 py-0.5 text-xs font-medium text-accent-blue shrink-0">
                        Visível
                      </span>
                    ) : (
                      <span className="rounded-badge bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-secondary shrink-0">
                        Oculto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      to={`/admin/portfolio/${item.id}/edit`}
                      className="text-sm font-medium text-accent-blue hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleToggle(item)}
                      title={item.visible ? 'Ocultar' : 'Exibir'}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {item.visible ? 'Ocultar' : 'Exibir'}
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Excluir"
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}