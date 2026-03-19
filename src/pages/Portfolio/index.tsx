import { useEffect, useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import { Reveal } from '@/components/ui/Reveal'
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

const PAGE_SIZE = 9

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    portfolioService.list()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  // Reset pagination when filter changes
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [activeCategory])

  const categories = ['Todos', ...Array.from(new Set(items.map(i => i.category.name)))]
  const uniqueMaterials = new Set(items.map(i => i.material)).size

  const filtered = activeCategory === 'Todos'
    ? items
    : items.filter(i => i.category.name === activeCategory)

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <PageWrapper>
      <SEOHead
        title="Portfólio"
        description="Veja nossos projetos de impressão 3D: miniaturas, peças técnicas, protótipos, cosplay e mais. Materiais PLA, PETG, ASA e resina."
        canonical="/portfolio"
        jsonLd={portfolioJsonLd}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 5% 4rem' }}>

        {/* ── Hero ── */}
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6" style={{ marginBottom: '2rem' }}>
          <div style={{ maxWidth: 520 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#06b6d4', marginBottom: 6 }}>
              Portfólio
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-.5px', color: '#e8edf3', marginBottom: 8 }}>
              Nossos projetos
            </h1>
            <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.7 }}>
              Conheça alguns dos trabalhos que já realizamos. Cada peça é única, feita sob medida com impressão 3D de alta qualidade.
            </p>
          </div>

          {!loading && items.length > 0 && (
            <div className="flex gap-8">
              {[
                { num: items.length.toString(), label: 'Projetos' },
                { num: `${uniqueMaterials}+`,   label: 'Materiais' },
                { num: '24h',                   label: 'Resposta' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: '#22d3ee' }}>{num}</div>
                  <div style={{ fontSize: 11, color: '#556677', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        </Reveal>

        {/* ── Toolbar ── */}
        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: '2rem' }}>
            {/* Category filters */}
            <div className="flex flex-wrap gap-2" style={{ overflowX: 'auto' }}>
              {categories.map(cat => {
                const count = cat === 'Todos' ? items.length : items.filter(i => i.category.name === cat).length
                const isActive = cat === activeCategory
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      fontSize: 13, fontWeight: 500,
                      padding: '7px 16px',
                      borderRadius: 50,
                      border: isActive ? '1px solid #06b6d4' : '1px solid rgba(56,189,248,.08)',
                      background: isActive ? 'rgba(6,182,212,.12)' : 'transparent',
                      color: isActive ? '#22d3ee' : '#8899aa',
                      cursor: 'pointer',
                      transition: 'all .2s',
                      whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {cat}
                    <span style={{
                      fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                      background: isActive ? 'rgba(6,182,212,.2)' : 'rgba(255,255,255,.06)',
                      color: isActive ? '#22d3ee' : '#556677',
                      padding: '1px 7px', borderRadius: 50,
                    }}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* View toggle */}
            <div className="hidden md:flex" style={{ gap: 4, background: '#0c1219', border: '1px solid rgba(56,189,248,.08)', borderRadius: 6, padding: 3 }}>
              {(['grid', 'list'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  title={v === 'grid' ? 'Grade' : 'Lista'}
                  style={{
                    background: view === v ? '#111a24' : 'none',
                    border: 'none', cursor: 'pointer',
                    padding: '6px 10px', borderRadius: 4,
                    color: view === v ? '#22d3ee' : '#556677',
                    transition: 'all .2s',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {v === 'grid' ? <GridIcon /> : <ListIcon />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'flex flex-col gap-3'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[14px] bg-surface-2 animate-pulse" style={{ aspectRatio: '4/3' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem 1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3d4f5f" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 1rem' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#e8edf3', marginBottom: 4 }}>Nenhum projeto encontrado</h3>
            <p style={{ fontSize: 14, color: '#8899aa' }}>Tente selecionar outro filtro.</p>
          </div>
        ) : (
          <div className={`${view === 'list' ? 'pf-list flex flex-col gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}`}>
            {visible.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                view={view}
                animationDelay={Math.min(i, 8) * 0.05}
              />
            ))}
          </div>
        )}

        {/* ── Load more ── */}
        {hasMore && (
          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              style={{
                fontSize: 14, fontWeight: 600,
                color: '#8899aa',
                background: '#0c1219',
                border: '1px solid rgba(56,189,248,.08)',
                borderRadius: 50,
                padding: '12px 36px',
                cursor: 'pointer',
                transition: 'all .25s',
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(56,189,248,.2)'; b.style.color = '#22d3ee'; b.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = 'rgba(56,189,248,.08)'; b.style.color = '#8899aa'; b.style.transform = '' }}
            >
              Ver mais projetos
            </button>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}