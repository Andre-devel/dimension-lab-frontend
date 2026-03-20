import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
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

export default function AdminQuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const [quote, setQuote] = useState<Quote | null | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('RECEIVED')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)

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
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/admin" className="text-sm text-accent-blue hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Detalhes do Orçamento</h1>
        </div>

        {quote === undefined ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : quote === null ? (
          <p className="text-text-secondary">Orçamento não encontrado.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Order details */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Detalhes do Pedido</h2>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Descrição</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.description}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Material</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.material}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Cor</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.color}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Quantidade</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.quantity}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Acabamento</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.finish}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Prazo desejado</dt>
                  <dd className="mt-1 text-sm text-text-primary">{quote.desiredDeadline}</dd>
                </div>
              </dl>
            </Card>

            {/* Customer */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Cliente</h2>
              {quote.customer ? (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase text-text-secondary">Nome</dt>
                    <dd className="mt-1 text-sm text-text-primary">{quote.customer.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-text-secondary">E-mail</dt>
                    <dd className="mt-1 text-sm text-text-primary">{quote.customer.email}</dd>
                  </div>
                  {quote.customer.phone && (
                    <div>
                      <dt className="text-xs font-medium uppercase text-text-secondary">WhatsApp</dt>
                      <dd className="mt-1 text-sm text-text-primary">{quote.customer.phone}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-text-secondary">Dados do cliente não disponíveis.</p>
              )}
            </Card>

            {/* Files */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Arquivos</h2>
              {quote.files && quote.files.length > 0 ? (
                <ul className="space-y-2">
                  {quote.files.map((file) => (
                    <li key={file.id} className="flex items-center gap-3 text-sm">
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {file.fileType}
                      </span>
                      <span className="text-text-primary">{file.filePath}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">Nenhum arquivo enviado.</p>
              )}
            </Card>

            {/* Status update */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Atualizar Status</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label
                    htmlFor="status-select"
                    className="mb-1 block text-xs font-medium uppercase text-text-secondary"
                  >
                    Novo status
                  </label>
                  <select
                    id="status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus)}
                    className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {QUOTE_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
              {successMessage && (
                <p className="mt-3 text-sm text-green-400">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="mt-3 text-sm text-red-400">{errorMessage}</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}