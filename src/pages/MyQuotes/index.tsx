import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
import { StatusBadge } from '@/components/ui/Badge'
import { quoteService } from '@/services/quoteService'
import { useQuoteNotifications } from '@/hooks/useQuoteNotifications'
import type { Quote } from '@/types/quote'

export default function MyQuotes() {
  const [quotes, setQuotes]             = useState<Quote[]>([])
  const [loading, setLoading]           = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [cancelError, setCancelError]   = useState<string | null>(null)
  const { updatedIds } = useQuoteNotifications(quotes)

  useEffect(() => {
    quoteService.listMine().then(setQuotes).finally(() => setLoading(false))
  }, [])

  async function handleCancel(id: string) {
    setCancellingId(id)
    setConfirmingId(null)
    setCancelError(null)
    try {
      const updated = await quoteService.cancel(id)
      setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)))
    } catch (err: any) {
      const data = err?.response?.data
      setCancelError(data?.details?.[0] ?? data?.message ?? 'Não foi possível cancelar o orçamento. Tente novamente.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-3xl px-4 py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <BackButton />
          </div>
          <p className="text-xs font-mono text-[#7A7A9A] uppercase tracking-widest mb-1">Área do cliente</p>
          <h1 className="text-2xl font-bold text-[#F0F0FF]">Meus Orçamentos</h1>
        </div>

        {cancelError && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            <span>{cancelError}</span>
            <button type="button" onClick={() => setCancelError(null)} className="shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity">✕</button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 py-12 text-[#7A7A9A] text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-[#4D9FFF] border-t-transparent animate-spin" />
            Carregando orçamentos…
          </div>
        )}

        {!loading && quotes.length === 0 && (
          <div className="rounded-2xl p-12 text-center flex flex-col items-center gap-6"
               style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                 style={{ background: 'rgba(77,159,255,0.1)', border: '1px solid rgba(77,159,255,0.2)' }}>
              📋
            </div>
            <div>
              <p className="text-[#F0F0FF] font-semibold mb-1">Nenhum orçamento ainda</p>
              <p className="text-sm text-[#7A7A9A]">Solicite seu primeiro orçamento gratuitamente.</p>
            </div>
            <Link to="/quote" className="q-submit-btn inline-block px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
                  style={{ width: 'auto', padding: '12px 32px' }}>
              Solicitar orçamento
            </Link>
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <div className="flex flex-col gap-4">

            {/* Glow separator */}
            <div className="h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, #00dcc8, transparent)', opacity: 0.18 }} />

            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="rounded-2xl p-5 transition-all duration-200"
                style={{
                  background: 'var(--panel-bg)',
                  border: `1px solid ${updatedIds.has(quote.id) ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: updatedIds.has(quote.id) ? '0 0 16px rgba(139,92,246,0.1)' : 'none',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                  {/* Info */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#F0F0FF] text-sm">{quote.description}</p>
                      {updatedIds.has(quote.id) && (
                        <span className="rounded-badge px-2 py-0.5 text-xs font-semibold"
                              style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
                          Atualizado
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono flex-wrap">
                      <span className="text-[#4D9FFF]">{quote.material}</span>
                      {quote.color && <span className="text-[#7A7A9A]">{quote.color}</span>}
                      <span className="text-[#7A7A9A]">{quote.quantity}x</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#7A7A9A]">
                      <span>Prazo: {new Date(quote.desiredDeadline).toLocaleDateString('pt-BR')}</span>
                      <span className="font-mono">{new Date(quote.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={quote.status} />
                    {quote.status === 'RECEIVED' && (
                      confirmingId === quote.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7A7A9A]">Cancelar?</span>
                          <button
                            type="button"
                            disabled={cancellingId === quote.id}
                            onClick={() => handleCancel(quote.id)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                            style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(239,68,68,0.08)' }}
                          >
                            {cancellingId === quote.id ? 'Cancelando…' : 'Sim'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingId(null)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                            style={{ color: '#7A7A9A', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent' }}
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setCancelError(null); setConfirmingId(quote.id) }}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
                          style={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', background: 'transparent' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
                        >
                          Cancelar
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Bottom line for file count */}
                {quote.files && quote.files.length > 0 && (
                  <>
                    <div className="mt-4 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <p className="mt-3 text-xs font-mono text-[#7A7A9A]">
                      {quote.files.length} arquivo{quote.files.length > 1 ? 's' : ''} anexado{quote.files.length > 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
