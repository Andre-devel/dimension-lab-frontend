import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { portfolioService, type PortfolioItemFormData } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import PortfolioItemForm from './PortfolioItemForm'

export default function EditPortfolioItem() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<PortfolioItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      portfolioService.getById(id).then(setItem)
    }
  }, [id])

  async function handleSubmit(data: PortfolioItemFormData) {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      await portfolioService.update(id, data)
      navigate('/admin/portfolio')
    } catch {
      setError('Erro ao atualizar item. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/admin/portfolio" className="text-sm text-accent-blue hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Editar Item</h1>
        </div>

        {!item ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : (
          <div className="rounded-card bg-surface p-6">
            <PortfolioItemForm initialData={item} onSubmit={handleSubmit} saving={saving} />
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}