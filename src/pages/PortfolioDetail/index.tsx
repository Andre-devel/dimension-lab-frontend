import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<PortfolioItem | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    portfolioService.getById(id).then(setItem).catch(() => setItem(null))
  }, [id])

  const jsonLd = item
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Portfólio', item: `${SITE_URL}/portfolio` },
            { '@type': 'ListItem', position: 3, name: item.title, item: `${SITE_URL}/portfolio/${id}` },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: item.title,
          description: item.description ?? `${item.title} — impressão 3D em ${item.material}`,
          image: item.photos.length > 0 ? fileUrl(item.photos[0]) : undefined,
          category: item.category.name,
          material: item.material,
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Dimension.Lab3D' },
          },
        },
      ]
    : undefined

  return (
    <PageWrapper>
      {item && (
        <SEOHead
          title={item.title}
          description={`${item.title} — impressão 3D em ${item.material}${item.category ? `, categoria ${item.category.name}` : ''}. Veja fotos e detalhes.`}
          canonical={`/portfolio/${id}`}
          ogType="article"
          ogImage={item.photos.length > 0 ? fileUrl(item.photos[0]) : undefined}
          jsonLd={jsonLd}
        />
      )}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/portfolio" className="mb-6 inline-block text-sm text-accent-blue hover:underline">
          ← Voltar
        </Link>

        {item === undefined ? (
          <p className="text-text-secondary">Carregando...</p>
        ) : item === null ? (
          <p className="text-text-secondary">Item não encontrado.</p>
        ) : (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-text-primary">{item.title}</h1>

            {/* Photos */}
            {item.photos.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {item.photos.map((photo, i) => (
                  <img
                    key={i}
                    src={fileUrl(photo)}
                    alt={`${item.title} - foto ${i + 1}`}
                    width={600}
                    height={400}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            {/* 3D viewer */}
            {item.modelFile && (
              <Card>
                <h2 className="mb-3 text-lg font-semibold text-text-primary">Modelo 3D</h2>
                {/* @ts-expect-error model-viewer is a custom element */}
                <model-viewer
                  src={fileUrl(item.modelFile)}
                  alt={item.title}
                  auto-rotate
                  camera-controls
                  style={{ width: '100%', height: '400px' }}
                />
              </Card>
            )}

            {/* Details */}
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Detalhes</h2>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Categoria</dt>
                  <dd className="mt-1 text-sm text-text-primary">{item.category.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase text-text-secondary">Material</dt>
                  <dd className="mt-1 text-sm text-text-primary">{item.material}</dd>
                </div>
                {item.complexity && (
                  <div>
                    <dt className="text-xs font-medium uppercase text-text-secondary">Complexidade</dt>
                    <dd className="mt-1 text-sm text-text-primary">{item.complexity}</dd>
                  </div>
                )}
                {item.printTime != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase text-text-secondary">Tempo de impressão</dt>
                    <dd className="mt-1 text-sm text-text-primary">{item.printTime}h</dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}