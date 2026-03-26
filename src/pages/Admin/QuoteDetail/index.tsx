import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatusBadge } from '@/components/ui/Badge'
import { BackButton } from '@/components/ui/BackButton'
import { Link } from 'react-router-dom'
import { quoteService } from '@/services/quoteService'
import type { Quote, QuoteStatus } from '@/types/quote'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/constants/quoteStatus'
import { fileUrl } from '@/utils/fileUrl'

const ALL_STATUSES: QuoteStatus[] = [
  'RECEIVED',
  'UNDER_REVIEW',
  'APPROVED',
  'PRINTING',
  'READY',
  'DELIVERED',
]

const FILE_TYPE_ICONS: Record<string, string> = {
  IMAGE:    '🖼',
  VIDEO:    '🎬',
  MODEL_3D: '📐',
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <dt
        className="mb-1 font-mono uppercase"
        style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgb(var(--c-text-secondary))' }}
      >
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  )
}

export default function AdminQuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const [quote, setQuote]               = useState<Quote | null | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('RECEIVED')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage]     = useState('')
  const [saving, setSaving]             = useState(false)

  useEffect(() => {
    quoteService.listAll().then((data) => {
      const found = data.find((q) => q.id === id) ?? null
      setQuote(found)
      if (found) setSelectedStatus(found.status)
    })
  }, [id])

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const updated = await quoteService.updateStatus(id, selectedStatus)
      setQuote(updated)
      setSuccessMessage('Status atualizado com sucesso!')
    } catch {
      setErrorMessage('Erro ao atualizar status. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <BackButton to="/admin" label="Dashboard" />
          <div className="h-4 w-px bg-border" />
          <div>
            <p className="text-xs font-mono text-text-secondary tracking-widest uppercase">
              Orçamento
            </p>
          </div>
          {quote && (
            <div className="ml-auto">
              <StatusBadge status={quote.status} />
            </div>
          )}
        </div>

        {quote === undefined ? (
          <div className="flex items-center gap-3 py-12 text-text-secondary text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-[rgb(var(--c-accent-blue))] border-t-transparent animate-spin" />
            Carregando…
          </div>
        ) : quote === null ? (
          <div className="rounded-2xl p-12 text-center"
               style={{ border: '1px solid var(--panel-border)', background: 'rgb(var(--c-surface))' }}>
            <p className="text-text-secondary">Orçamento não encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* ID badge */}
              <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
                   style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">ID</span>
                <span className="font-mono text-xs text-[rgb(var(--c-accent-blue))] break-all">{quote.id}</span>
              </div>

              {/* Pedido */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5 font-mono">
                  Detalhes do Pedido
                </h2>

                {/* Glow separator */}
                <div className="h-px mb-5" style={{
                  background: 'linear-gradient(90deg, transparent, rgb(var(--c-accent-teal)), transparent)',
                  opacity: 0.18,
                }} />

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <InfoRow label="Descrição" value={quote.description} />
                  </div>
                  <InfoRow label="Material"       value={quote.material} />
                  <InfoRow label="Cor"            value={quote.color} />
                  <InfoRow label="Quantidade"     value={quote.quantity} />
                  <InfoRow label="Prazo desejado" value={quote.desiredDeadline} />
                  <div className="sm:col-span-2">
                    <dt className="mb-1 font-mono uppercase"
                        style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgb(var(--c-text-secondary))' }}>
                      Data de criação
                    </dt>
                    <dd className="text-sm text-text-primary font-mono">
                      {new Date(quote.createdAt).toLocaleString('pt-BR')}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Arquivos */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5 font-mono">
                  Arquivos ({quote.files?.length ?? 0})
                </h2>
                <div className="h-px mb-5" style={{
                  background: 'linear-gradient(90deg, transparent, rgb(var(--c-accent-teal)), transparent)',
                  opacity: 0.18,
                }} />

                {quote.files && quote.files.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quote.files.map((file) => (
                      <div
                        key={file.id}
                        className="rounded-xl p-3 flex items-start gap-3 transition-colors duration-150"
                        style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgb(var(--c-accent-blue) / 0.25)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                      >
                        <span className="text-xl flex-shrink-0">
                          {FILE_TYPE_ICONS[file.fileType] ?? '📄'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-[rgb(var(--c-accent-blue))] mb-1">{file.fileType}</p>
                          {file.fileType === 'IMAGE' ? (
                            <a
                              href={fileUrl(file.filePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-text-secondary hover:text-text-primary truncate block transition-colors"
                            >
                              {file.filePath.split('/').pop()}
                            </a>
                          ) : (
                            <p className="text-xs text-text-secondary truncate">{file.filePath.split('/').pop()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Nenhum arquivo enviado.</p>
                )}
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">

              {/* Cliente */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5 font-mono">
                  Cliente
                </h2>
                <div className="h-px mb-5" style={{
                  background: 'linear-gradient(90deg, transparent, rgb(var(--c-accent-teal)), transparent)',
                  opacity: 0.18,
                }} />

                {quote.customer ? (
                  <dl className="space-y-4">
                    <InfoRow label="Nome"     value={quote.customer.name} />
                    <InfoRow label="E-mail"   value={quote.customer.email} />
                    <InfoRow label="Telefone" value={quote.customer.phone} />
                  </dl>
                ) : (
                  <div className="rounded-xl px-4 py-3"
                       style={{ background: 'rgb(var(--c-accent-amber) / 0.08)', border: '1px solid rgb(var(--c-accent-amber) / 0.2)' }}>
                    <p className="text-xs text-[rgb(var(--c-accent-amber))]">Orçamento anônimo</p>
                  </div>
                )}
              </div>

              {/* Referência do portfólio */}
              {quote.portfolioItemId && (
                <div className="rounded-2xl p-6"
                     style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                  <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5 font-mono">
                    Referência do Portfólio
                  </h2>
                  <div className="h-px mb-5" style={{
                    background: 'linear-gradient(90deg, transparent, rgb(var(--c-accent-teal)), transparent)',
                    opacity: 0.18,
                  }} />
                  <Link
                    to={`/portfolio/${quote.portfolioItemId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-[rgb(var(--c-accent-blue))] hover:underline break-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Ver item no portfólio
                  </Link>
                </div>
              )}

              {/* Atualizar status */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'rgb(var(--c-surface))', border: '1px solid var(--panel-border)' }}>
                <h2 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-5 font-mono">
                  Atualizar Status
                </h2>
                <div className="h-px mb-5" style={{
                  background: 'linear-gradient(90deg, transparent, rgb(var(--c-accent-teal)), transparent)',
                  opacity: 0.18,
                }} />

                <div className="flex flex-col gap-2 mb-5">
                  {ALL_STATUSES.map((s) => {
                    const color    = QUOTE_STATUS_COLORS[s]
                    const selected = selectedStatus === s
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedStatus(s)}
                        className="w-full text-left rounded-xl px-4 py-2.5 text-xs font-semibold
                                   flex items-center gap-2.5 transition-all duration-150"
                        style={selected ? {
                          background:  `${color}18`,
                          border:      `1px solid ${color}50`,
                          color,
                          boxShadow:   `0 0 12px ${color}22`,
                        } : {
                          background:  'transparent',
                          border:      '1px solid rgba(255,255,255,0.06)',
                          color:       'rgb(var(--c-text-secondary))',
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: selected ? color : 'rgb(var(--c-border))' }}
                        />
                        {QUOTE_STATUS_LABELS[s]}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || selectedStatus === quote.status}
                  className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest
                             transition-all duration-200"
                  style={{
                    background:  saving || selectedStatus === quote.status
                      ? 'rgb(var(--c-accent-blue) / 0.08)'
                      : 'linear-gradient(135deg, rgb(var(--c-accent-cyan)) 0%, rgb(var(--c-accent-blue)) 40%, rgb(var(--c-accent-purple)) 100%)',
                    color:       saving || selectedStatus === quote.status ? 'rgb(var(--c-accent-blue) / 0.53)' : 'rgb(var(--c-white))',
                    border:      '1px solid rgb(var(--c-accent-blue) / 0.3)',
                    cursor:      saving || selectedStatus === quote.status ? 'not-allowed' : 'pointer',
                    boxShadow:   saving || selectedStatus === quote.status
                      ? 'none'
                      : '0 4px 20px rgb(var(--c-accent-cyan) / 0.2)',
                  }}
                >
                  {saving ? 'Salvando…' : 'Salvar status'}
                </button>

                {successMessage && (
                  <p className="mt-3 text-xs font-mono text-[rgb(var(--c-accent-green))] flex items-center gap-1.5">
                    <span>✓</span> {successMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="mt-3 text-xs font-mono text-red-400 flex items-center gap-1.5">
                    <span>✗</span> {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}