import { useCallback, useEffect, useRef, useState } from 'react'

const CATEGORY_LIMIT = 5
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import { Reveal } from '@/components/ui/Reveal'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'
import { portfolioService } from '@/services/portfolioService'
import type { CategorySummary } from '@/services/portfolioService'
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
  const [serverCategories, setServerCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [allItemsTotal, setAllItemsTotal] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string>('Todos')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showMoreCategories, setShowMoreCategories] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  // Load categories once
  useEffect(() => {
    portfolioService.listCategories().then(setServerCategories)
  }, [])

  // Reload items from server whenever category changes (server-side filtering)
  useEffect(() => {
    setLoading(true)
    setItems([])
    setPage(0)
    setHasNext(false)
    const cat = activeCategory === 'Todos' ? undefined : activeCategory
    portfolioService.list(0, PAGE_SIZE, cat)
      .then(res => {
        setItems(res.content)
        setHasNext(res.hasNext)
        if (!cat) setAllItemsTotal(res.totalElements)
      })
      .finally(() => setLoading(false))
  }, [activeCategory])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasNext) return
    const nextPage = page + 1
    setLoadingMore(true)
    const cat = activeCategory === 'Todos' ? undefined : activeCategory
    portfolioService.list(nextPage, PAGE_SIZE, cat)
      .then(res => {
        setItems(prev => [...prev, ...res.content])
        setHasNext(res.hasNext)
        setPage(nextPage)
      })
      .finally(() => setLoadingMore(false))
  }, [loadingMore, hasNext, page, activeCategory])

  // Infinite scroll: re-attach observer whenever loadMore changes
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  // Close "Mais" dropdown on outside click
  useEffect(() => {
    if (!showMoreCategories) return
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreCategories(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMoreCategories])

  const allCategories = serverCategories
  const visibleCategories = allCategories.slice(0, CATEGORY_LIMIT - 1) // -1 to leave room for "Todos"
  const hiddenCategories = allCategories.slice(CATEGORY_LIMIT - 1)
  const uniqueMaterials = new Set(items.map(i => i.material)).size

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
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgb(var(--c-accent-teal))', marginBottom: 6 }}>
              Portfólio
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-.5px', color: 'rgb(var(--c-text-bright))', marginBottom: 8 }}>
              Nossos projetos
            </h1>
            <p style={{ fontSize: 14, color: 'rgb(var(--c-text-secondary))', lineHeight: 1.7 }}>
              Conheça alguns dos trabalhos que já realizamos. Cada peça é única, feita sob medida com impressão 3D de alta qualidade.
            </p>
          </div>

          {!loading && allItemsTotal > 0 && (
            <div className="flex gap-8">
              {[
                { num: allItemsTotal.toString(), label: 'Projetos' },
                { num: `${uniqueMaterials}+`,    label: 'Materiais' },
                { num: '24h',                    label: 'Resposta' },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: 'rgb(var(--c-accent-teal))' }}>{num}</div>
                  <div style={{ fontSize: 11, color: 'rgb(var(--c-text-secondary))', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        </Reveal>

        {/* ── Toolbar ── */}
        {!loading && (
          <div style={{ marginBottom: '2rem' }}>

            {/* ── Mobile: todas as categorias em scroll horizontal ── */}
            <div
              data-testid="category-bar-mobile"
              className="flex md:hidden gap-2 pb-1"
              style={{ overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}
            >
              {[{ name: 'Todos', count: allItemsTotal }, ...allCategories].map(cat => {
                const isActive = cat.name === activeCategory
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    style={{
                      fontSize: 12, fontWeight: 500,
                      padding: '6px 13px', borderRadius: 50,
                      border: isActive ? '1px solid rgb(var(--c-accent-teal))' : '1px solid rgb(var(--c-accent-teal) / .08)',
                      background: isActive ? 'rgb(var(--c-accent-teal) / .12)' : 'transparent',
                      color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                      cursor: 'pointer', transition: 'all .2s',
                      whiteSpace: 'nowrap', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {cat.name}
                    <span style={{
                      fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                      background: isActive ? 'rgb(var(--c-accent-teal) / .2)' : 'rgba(255,255,255,.06)',
                      color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                      padding: '1px 6px', borderRadius: 50,
                    }}>
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── Desktop: pills limitados + dropdown Mais + view toggle ── */}
            <div className="hidden md:flex items-center justify-between gap-3">
              <div data-testid="category-bar-desktop" className="flex items-center gap-2">
                {/* "Todos" pill sempre visível */}
                {(() => {
                  const isActive = activeCategory === 'Todos'
                  return (
                    <button
                      onClick={() => setActiveCategory('Todos')}
                      style={{
                        fontSize: 13, fontWeight: 500,
                        padding: '7px 16px', borderRadius: 50,
                        border: isActive ? '1px solid rgb(var(--c-accent-teal))' : '1px solid rgb(var(--c-accent-teal) / .08)',
                        background: isActive ? 'rgb(var(--c-accent-teal) / .12)' : 'transparent',
                        color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                        cursor: 'pointer', transition: 'all .2s',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      Todos
                      <span style={{
                        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                        background: isActive ? 'rgb(var(--c-accent-teal) / .2)' : 'rgba(255,255,255,.06)',
                        color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                        padding: '1px 7px', borderRadius: 50,
                      }}>
                        {allItemsTotal}
                      </span>
                    </button>
                  )
                })()}

                {visibleCategories.map(cat => {
                  const isActive = cat.name === activeCategory
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      style={{
                        fontSize: 13, fontWeight: 500,
                        padding: '7px 16px', borderRadius: 50,
                        border: isActive ? '1px solid rgb(var(--c-accent-teal))' : '1px solid rgb(var(--c-accent-teal) / .08)',
                        background: isActive ? 'rgb(var(--c-accent-teal) / .12)' : 'transparent',
                        color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                        cursor: 'pointer', transition: 'all .2s',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      {cat.name}
                      <span style={{
                        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                        background: isActive ? 'rgb(var(--c-accent-teal) / .2)' : 'rgba(255,255,255,.06)',
                        color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                        padding: '1px 7px', borderRadius: 50,
                      }}>
                        {cat.count}
                      </span>
                    </button>
                  )
                })}

                {/* "Mais" dropdown */}
                {hiddenCategories.length > 0 && (
                  <div ref={moreRef} style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowMoreCategories(v => !v)}
                      style={{
                        fontSize: 13, fontWeight: 500,
                        padding: '7px 14px', borderRadius: 50,
                        border: hiddenCategories.some(c => c.name === activeCategory)
                          ? '1px solid rgb(var(--c-accent-teal))'
                          : '1px solid rgb(var(--c-accent-teal) / .08)',
                        background: hiddenCategories.some(c => c.name === activeCategory)
                          ? 'rgb(var(--c-accent-teal) / .12)' : 'transparent',
                        color: hiddenCategories.some(c => c.name === activeCategory)
                          ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                        cursor: 'pointer', transition: 'all .2s',
                        whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      {hiddenCategories.some(c => c.name === activeCategory) ? activeCategory : `Mais (${hiddenCategories.length})`}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: showMoreCategories ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {showMoreCategories && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                        background: 'rgb(var(--c-surface))',
                        border: '1px solid rgb(var(--c-accent-teal) / .12)',
                        borderRadius: 10, padding: '6px',
                        minWidth: 160, zIndex: 50,
                        boxShadow: '0 8px 24px rgba(0,0,0,.35)',
                      }}>
                        {hiddenCategories.map(cat => {
                          const isActive = cat.name === activeCategory
                          return (
                            <button
                              key={cat.name}
                              onClick={() => { setActiveCategory(cat.name); setShowMoreCategories(false) }}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', padding: '8px 12px', borderRadius: 7,
                                border: 'none', cursor: 'pointer', gap: 8,
                                background: isActive ? 'rgb(var(--c-accent-teal) / .12)' : 'transparent',
                                color: isActive ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                                fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                                transition: 'background .15s',
                              }}
                            >
                              {cat.name}
                              <span style={{
                                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                                background: 'rgba(255,255,255,.06)',
                                padding: '1px 7px', borderRadius: 50,
                              }}>
                                {cat.count}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="flex" style={{ gap: 4, background: 'rgb(var(--c-surface))', border: '1px solid rgb(var(--c-accent-teal) / .08)', borderRadius: 6, padding: 3 }}>
                {(['grid', 'list'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    title={v === 'grid' ? 'Grade' : 'Lista'}
                    style={{
                      background: view === v ? 'rgb(var(--c-surface))' : 'none',
                      border: 'none', cursor: 'pointer',
                      padding: '6px 10px', borderRadius: 4,
                      color: view === v ? 'rgb(var(--c-accent-teal))' : 'rgb(var(--c-text-secondary))',
                      transition: 'all .2s',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {v === 'grid' ? <GridIcon /> : <ListIcon />}
                  </button>
                ))}
              </div>
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
        ) : items.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem 1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--c-text-muted))" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 1rem' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'rgb(var(--c-text-bright))', marginBottom: 4 }}>Nenhum projeto encontrado</h3>
            <p style={{ fontSize: 14, color: 'rgb(var(--c-text-secondary))' }}>Tente selecionar outro filtro.</p>
          </div>
        ) : (
          <div className={`${view === 'list' ? 'pf-list flex flex-col gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}`}>
            {items.map((item, i) => (
              <PortfolioCard
                key={item.id}
                item={item}
                view={view}
                animationDelay={Math.min(i, 8) * 0.05}
              />
            ))}
          </div>
        )}

        {/* ── Infinite scroll sentinel + spinner ── */}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {(hasNext || loadingMore) && (
          <div role="status" className="flex justify-center" style={{ marginTop: '2rem' }}>
            <svg
              width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="rgb(var(--c-accent-teal))"
              strokeWidth="2" strokeLinecap="round"
              className="animate-spin"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}