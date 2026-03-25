import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatusBadge } from '@/components/ui/Badge'
import { quoteService } from '@/services/quoteService'
import type { Quote, QuoteStatus } from '@/types/quote'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/constants/quoteStatus'

const ALL_STATUSES: QuoteStatus[] = [
  'RECEIVED',
  'UNDER_REVIEW',
  'APPROVED',
  'PRINTING',
  'READY',
  'DELIVERED',
]

const KPI_STATUSES: { status: QuoteStatus; label: string }[] = [
  { status: 'RECEIVED',     label: 'Recebidos'  },
  { status: 'UNDER_REVIEW', label: 'Em análise' },
  { status: 'PRINTING',     label: 'Imprimindo' },
  { status: 'READY',        label: 'Prontos'    },
]

const NAV_LINKS = [
  { to: '/admin/portfolio',  label: 'Portfólio'     },
  { to: '/admin/materials',  label: 'Materiais'     },
  { to: '/admin/colors',     label: 'Cores'         },
  { to: '/admin/settings',   label: 'Configurações' },
]

function truncate(text: string, max = 55) {
  return text.length <= max ? text : text.slice(0, max) + '…'
}

export default function AdminDashboard() {
  const [quotes, setQuotes]             = useState<Quote[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeFilter, setActiveFilter] = useState<QuoteStatus | null>(null)

  useEffect(() => {
    quoteService.listAll().then(setQuotes).finally(() => setLoading(false))
  }, [])

  const filtered = activeFilter ? quotes.filter((q) => q.status === activeFilter) : quotes
  const countOf  = (s: QuoteStatus) => quotes.filter((q) => q.status === s).length

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-mono text-text-secondary tracking-widest uppercase mb-1">
              Painel de Controle
            </p>
            <h1 className="text-2xl font-bold text-text-primary">
              Painel Admin
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold
                           text-[#4D9FFF] border border-[#4D9FFF33] bg-[#4D9FFF0D]
                           hover:bg-[#4D9FFF1A] hover:border-[#4D9FFF66]
                           hover:shadow-[0_0_12px_rgba(77,159,255,0.2)]
                           transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_STATUSES.map(({ status, label }) => {
            const color  = QUOTE_STATUS_COLORS[status]
            const count  = countOf(status)
            const active = activeFilter === status
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(active ? null : status)}
                className="text-left rounded-2xl p-5 transition-all duration-200 group"
                style={{
                  background:  'linear-gradient(135deg, #12121A 0%, #0e1520 100%)',
                  border:      `1px solid ${active ? color + '60' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow:   active ? `0 0 20px ${color}22` : 'none',
                }}
              >
                <p className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: color + 'BB' }}>
                  {label}
                </p>
                <p className="text-3xl font-bold text-text-primary">{count}</p>
              </button>
            )
          })}
        </div>

        {/* ── Glow separator ── */}
        <div className="h-px w-full" style={{
          background: 'linear-gradient(90deg, transparent, #00dcc8, transparent)',
          opacity: 0.18,
        }} />

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-wider mr-2">Filtrar:</span>
          <button
            onClick={() => setActiveFilter(null)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-150',
              activeFilter === null
                ? 'bg-[#4D9FFF18] border-[#4D9FFF50] text-[#4D9FFF]'
                : 'bg-transparent border-[rgba(255,255,255,0.08)] text-text-secondary hover:text-text-primary hover:border-[rgba(255,255,255,0.18)]',
            ].join(' ')}
          >
            Todos ({quotes.length})
          </button>
          {ALL_STATUSES.map((status) => {
            const color  = QUOTE_STATUS_COLORS[status]
            const active = activeFilter === status
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(active ? null : status)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all duration-150"
                style={active ? {
                  backgroundColor: `${color}18`,
                  borderColor:     `${color}50`,
                  color,
                } : {
                  backgroundColor: 'transparent',
                  borderColor:     'rgba(255,255,255,0.08)',
                  color:           '#7A7A9A',
                }}
              >
                {QUOTE_STATUS_LABELS[status]}
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex items-center gap-3 py-12 text-text-secondary text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-[#4D9FFF] border-t-transparent animate-spin" />
            Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center"
               style={{ border: '1px solid var(--panel-border)', background: '#0e1118' }}>
            <p className="text-text-secondary text-sm">Nenhum orçamento encontrado.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block rounded-2xl overflow-hidden"
                 style={{ border: '1px solid var(--panel-border)', background: '#0e1118' }}>
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Cliente', 'Descrição', 'Material', 'Cor', 'Status', 'Data', ''].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3.5 text-left"
                        style={{
                          fontSize:      '10px',
                          fontFamily:    'JetBrains Mono, monospace',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color:         '#7A7A9A',
                          fontWeight:    600,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((quote, i) => (
                    <tr
                      key={quote.id}
                      className="group transition-colors duration-100 cursor-default"
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#141e30')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-text-primary whitespace-nowrap">
                        {quote.customer?.name ?? (
                          <span className="text-text-secondary italic text-xs">Anônimo</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-secondary max-w-[200px]">
                        {truncate(quote.description)}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-[#4D9FFF] whitespace-nowrap">
                        {quote.material}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-text-secondary whitespace-nowrap">
                        {quote.color || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-text-secondary whitespace-nowrap">
                        {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/admin/quotes/${quote.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D9FFF]
                                     border border-[#4D9FFF33] bg-[#4D9FFF0D] rounded-lg px-3 py-1.5
                                     hover:bg-[#4D9FFF1A] hover:border-[#4D9FFF66]
                                     hover:shadow-[0_0_10px_rgba(77,159,255,0.2)]
                                     transition-all duration-150 whitespace-nowrap"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {filtered.map((quote) => (
                <div
                  key={quote.id}
                  className="rounded-2xl p-4 space-y-3"
                  style={{ background: '#0e1118', border: '1px solid var(--panel-border)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary text-sm">
                      {quote.customer?.name ?? (
                        <span className="italic text-text-secondary text-xs">Anônimo</span>
                      )}
                    </span>
                    <StatusBadge status={quote.status} />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {truncate(quote.description)}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-[#4D9FFF]">{quote.material}</span>
                    {quote.color && <span className="text-text-secondary">{quote.color}</span>}
                    <span className="ml-auto text-text-secondary">
                      {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Link
                    to={`/admin/quotes/${quote.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#4D9FFF]
                               border border-[#4D9FFF33] bg-[#4D9FFF0D] rounded-lg px-3 py-1.5
                               hover:bg-[#4D9FFF1A] transition-all duration-150"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}