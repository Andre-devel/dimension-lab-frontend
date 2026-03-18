import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

const portfolioJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Portfólio', item: `${SITE_URL}/portfolio` },
  ],
}

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMaterial, setActiveMaterial] = useState<string | null>(null)

  useEffect(() => {
    portfolioService.list()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const materials = [...new Set(items.map((i) => i.material))]
  const filtered = activeMaterial ? items.filter((i) => i.material === activeMaterial) : items

  return (
    <PageWrapper>
      <SEOHead
        title="Portfólio"
        description="Veja nossos projetos de impressão 3D: miniaturas, peças técnicas, protótipos, cosplay e mais. Materiais PLA, PETG, ASA e resina."
        canonical="/portfolio"
        jsonLd={portfolioJsonLd}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary">Portfólio</h1>

        {/* Material filters */}
        {!loading && materials.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveMaterial(null)}
              className={[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeMaterial === null
                  ? 'border border-accent-blue text-accent-blue bg-surface'
                  : 'border border-border text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              Todos
            </button>
            {materials.map((m) => (
              <button
                key={m}
                onClick={() => setActiveMaterial(m)}
                className={[
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeMaterial === m
                    ? 'border border-accent-blue text-accent-blue bg-surface'
                    : 'border border-border text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-text-secondary">Nenhum item encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <PortfolioCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}