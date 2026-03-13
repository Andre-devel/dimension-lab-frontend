import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatusBadge } from '@/components/ui/Badge'
import { quoteService } from '@/services/quoteService'
import type { Quote, QuoteStatus } from '@/types/quote'
import { QUOTE_STATUS_LABELS } from '@/constants/quoteStatus'

const ALL_STATUSES: QuoteStatus[] = [
  'RECEIVED',
  'UNDER_REVIEW',
  'APPROVED',
  'PRINTING',
  'READY',
  'DELIVERED',
]

function truncate(text: string, maxLength = 60): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '…'
}

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<QuoteStatus | null>(null)

  useEffect(() => {
    quoteService
      .listAll()
      .then((data) => setQuotes(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeFilter
    ? quotes.filter((q) => q.status === activeFilter)
    : quotes

  return (
    <PageWrapper>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Painel Admin</h1>
          <Link
            to="/admin/portfolio"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Gerenciar Portfólio →
          </Link>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter(null)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              activeFilter === null
                ? 'border border-accent-blue text-accent-blue bg-surface'
                : 'border border-border text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            Todos
          </button>
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeFilter === status
                  ? 'border border-accent-blue text-accent-blue bg-surface'
                  : 'border border-border text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {QUOTE_STATUS_LABELS[status]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-secondary">Nenhum orçamento encontrado.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-card bg-surface">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    {['Cliente', 'Descrição', 'Material', 'Status', 'Data', 'Ação'].map((col) => (
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
                  {filtered.map((quote) => (
                    <tr key={quote.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {quote.customer?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {truncate(quote.description)}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{quote.material}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={quote.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/quotes/${quote.id}`}
                          className="text-sm font-medium text-accent-blue hover:underline"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="flex flex-col gap-4 md:hidden">
              {filtered.map((quote) => (
                <div key={quote.id} className="rounded-card bg-surface p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-text-primary">
                      {quote.customer?.name ?? '—'}
                    </span>
                    <StatusBadge status={quote.status} />
                  </div>
                  <p className="text-sm text-text-secondary">{truncate(quote.description)}</p>
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>{quote.material}</span>
                    <span>{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <Link
                    to={`/admin/quotes/${quote.id}`}
                    className="inline-block text-sm font-medium text-accent-blue hover:underline"
                  >
                    Ver detalhes
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