import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

export default function PortfolioAdmin() {
  const [items, setItems]     = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioService.listAll().then(setItems).finally(() => setLoading(false))
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
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-blue
                         border border-accent-blue/20 bg-accent-blue/5 rounded-lg px-3 py-1.5
                         hover:bg-accent-blue/10 hover:border-accent-blue/40 transition-all duration-150"
            >
              ← Dashboard
            </Link>
            <div className="h-4 w-px bg-border" />
            <div>
              <p className="text-xs font-mono text-text-secondary uppercase tracking-widest">Admin</p>
              <h1 className="text-xl font-bold text-text-primary leading-tight">Gerenciar Portfólio</h1>
            </div>
          </div>

          <Link
            to="/admin/portfolio/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest
                       text-white transition-all duration-200 self-start sm:self-auto hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--c-accent-cyan)) 0%, rgb(var(--c-accent-blue)) 40%, rgb(var(--c-accent-purple)) 100%)',
              boxShadow: '0 4px 16px rgb(var(--c-accent-blue) / 0.2)',
            }}
          >
            + Novo item
          </Link>
        </div>

        {/* Glow separator */}
        <div className="h-px" style={{ background: 'var(--glow-separator)', opacity: 0.18 }} />

        {loading ? (
          <div className="flex items-center gap-3 py-12 text-text-secondary text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
            Carregando…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
               style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
            <p className="text-text-secondary text-sm">Nenhum item no portfólio.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl overflow-hidden"
                 style={{ border: '1px solid var(--panel-border)', background: 'rgb(var(--c-surface))' }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['', 'Título', 'Categoria', 'Material', 'Status', 'Ações'].map((col) => (
                      <th key={col} className="px-5 py-3.5 text-left"
                          style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgb(var(--c-text-secondary))', fontWeight: 600 }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgb(var(--c-surface-2))')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      className="transition-colors duration-100"
                    >
                      <td className="px-4 py-2.5">
                        {item.photos?.[0] ? (
                          <img
                            src={fileUrl(item.photos[0])}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg bg-accent-blue/5"
                               style={{ border: '1px solid rgb(var(--c-accent-blue) / 0.15)' }}>
                            📷
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{item.title}</td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary">{item.category.name}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-accent-blue">{item.material}</td>
                      <td className="px-5 py-3.5">
                        {item.visible ? (
                          <span className="rounded-badge px-2.5 py-1 text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/25">
                            Visível
                          </span>
                        ) : (
                          <span className="rounded-badge px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border/40">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/portfolio/${item.id}/edit`}
                            className="text-xs font-semibold text-accent-blue border border-accent-blue/25 bg-accent-blue/5
                                       rounded-lg px-3 py-1.5 hover:bg-accent-blue/10 hover:border-accent-blue/50 transition-all duration-150"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleToggle(item)}
                            className="text-xs font-semibold text-text-secondary border border-border/40 rounded-lg px-3 py-1.5
                                       hover:text-text-primary hover:border-border transition-all duration-150"
                          >
                            {item.visible ? 'Ocultar' : 'Exibir'}
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-xs font-semibold text-red-400 border border-red-500/20 rounded-lg px-3 py-1.5
                                       hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-150"
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

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden"
                     style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>

                  {/* Thumbnail */}
                  {item.photos?.[0] ? (
                    <div className="w-full h-44 overflow-hidden">
                      <img
                        src={fileUrl(item.photos[0])}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center text-3xl bg-accent-blue/5"
                         style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      📷
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-text-primary text-sm">{item.title}</p>
                        <p className="text-xs font-mono text-accent-blue mt-0.5">
                          {item.category.name} · {item.material}
                        </p>
                      </div>
                      {item.visible ? (
                        <span className="rounded-badge px-2.5 py-1 text-xs font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/25 shrink-0">
                          Visível
                        </span>
                      ) : (
                        <span className="rounded-badge px-2.5 py-1 text-xs font-semibold text-text-secondary border border-border/40 shrink-0">
                          Oculto
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Link
                        to={`/admin/portfolio/${item.id}/edit`}
                        className="flex-1 text-center text-xs font-semibold text-accent-blue border border-accent-blue/25 bg-accent-blue/5
                                   rounded-lg px-3 py-2 hover:bg-accent-blue/10 transition-all duration-150"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggle(item)}
                        className="flex-1 text-xs font-semibold text-text-secondary border border-border/40 rounded-lg px-3 py-2
                                   hover:text-text-primary transition-all duration-150"
                      >
                        {item.visible ? 'Ocultar' : 'Exibir'}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-1 text-xs font-semibold text-red-400 border border-red-500/20 rounded-lg px-3 py-2
                                   hover:bg-red-500/10 transition-all duration-150"
                      >
                        Excluir
                      </button>
                    </div>
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
