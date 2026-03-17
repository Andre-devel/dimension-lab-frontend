import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatusBadge } from '@/components/ui/Badge'
import { quoteService } from '@/services/quoteService'
import { useQuoteNotifications } from '@/hooks/useQuoteNotifications'
import type { Quote } from '@/types/quote'

export default function MyQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const { updatedIds } = useQuoteNotifications(quotes)

  async function handleCancel(id: string) {
    if (!window.confirm('Tem certeza que deseja cancelar este orçamento?')) return
    setCancellingId(id)
    try {
      const updated = await quoteService.cancel(id)
      setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)))
    } catch {
      alert('Não foi possível cancelar o orçamento. Tente novamente.')
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    quoteService
      .listMine()
      .then(setQuotes)
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper>
      <section className="px-[5%] pt-28 pb-16">
        <h1 className="font-heading text-3xl font-bold text-text-primary mb-8">
          Meus Orçamentos
        </h1>

        {loading && (
          <p className="text-text-secondary">Carregando...</p>
        )}

        {!loading && quotes.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-text-secondary">Você ainda não enviou nenhum orçamento.</p>
            <Link
              to="/quote"
              className="rounded-full bg-accent-blue px-6 py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:shadow-glow transition-all"
            >
              Solicitar orçamento
            </Link>
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <ul className="flex flex-col gap-4">
            {quotes.map((quote) => (
              <li
                key={quote.id}
                className="rounded-card border border-border bg-surface p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{quote.description}</p>
                    {updatedIds.has(quote.id) && (
                      <span className="rounded-badge bg-accent-purple/20 px-2 py-0.5 text-xs font-medium text-accent-purple">
                        Atualizado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {quote.material} · {quote.quantity}x
                  </p>
                  <p className="text-xs text-text-secondary">
                    Prazo: {new Date(quote.desiredDeadline).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={quote.status} />
                  {quote.status === 'RECEIVED' && (
                    <button
                      type="button"
                      disabled={cancellingId === quote.id}
                      onClick={() => handleCancel(quote.id)}
                      className="rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === quote.id ? 'Cancelando…' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageWrapper>
  )
}