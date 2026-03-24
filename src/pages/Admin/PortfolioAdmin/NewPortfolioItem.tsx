import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
import { portfolioService, type PortfolioItemFormData } from '@/services/portfolioService'
import PortfolioItemForm from './PortfolioItemForm'

export default function NewPortfolioItem() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(data: PortfolioItemFormData) {
    setSaving(true)
    setError('')
    try {
      await portfolioService.create(data)
      navigate('/admin/portfolio')
    } catch {
      setError('Erro ao criar item. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <BackButton to="/admin/portfolio" label="Portfólio" />
          <div className="h-4 w-px bg-border" />
          <h1 className="text-xl font-bold text-text-primary">Novo Item</h1>
        </div>
        <div className="rounded-card bg-surface p-6">
          <PortfolioItemForm onSubmit={handleSubmit} saving={saving} />
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </PageWrapper>
  )
}