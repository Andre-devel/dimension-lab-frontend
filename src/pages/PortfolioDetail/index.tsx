import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BackButton } from '@/components/ui/BackButton'
import { Reveal } from '@/components/ui/Reveal'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

/* ── Lightbox ─────────────────────────────────────── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 24,
          background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)',
          borderRadius: '50%', width: 40, height: 40,
          color: '#e8edf3', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Fechar"
      >✕</button>
      <img
        src={src}
        alt={alt}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 10, objectFit: 'contain', cursor: 'default' }}
      />
    </div>
  )
}

/* ── Tag chip ─────────────────────────────────────── */
function Tag({ children, color }: { children: React.ReactNode; color?: 'cyan' | 'amber' | 'emerald' }) {
  const palettes = {
    cyan:    { background: 'rgba(6,182,212,.1)',   border: 'rgba(6,182,212,.2)',   color: '#22d3ee' },
    amber:   { background: 'rgba(251,191,36,.1)',  border: 'rgba(251,191,36,.2)',  color: '#fbbf24' },
    emerald: { background: 'rgba(52,211,153,.1)',  border: 'rgba(52,211,153,.2)',  color: '#34d399' },
  }
  const p = color ? palettes[color] : { background: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.08)', color: '#8899aa' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, letterSpacing: '.3px',
      padding: '4px 12px', borderRadius: 50,
      border: `1px solid ${p.border}`,
      background: p.background,
      color: p.color,
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  )
}

/* ── Related card ─────────────────────────────────── */
function RelatedCard({ item }: { item: PortfolioItem }) {
  return (
    <Link
      to={`/portfolio/${item.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      className="pf-card"
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', background: '#111a24' }}>
        {item.photos.length > 0 ? (
          <img
            src={fileUrl(item.photos[0])}
            alt={item.title}
            width={400} height={250}
            loading="lazy" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3d4f5f' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#e8edf3', marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Tag color="amber">{item.category.name}</Tag>
          <Tag color="cyan">{item.material}</Tag>
        </div>
      </div>
    </Link>
  )
}

/* ── Main component ───────────────────────────────── */
export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<PortfolioItem | null | undefined>(undefined)
  const [allItems, setAllItems] = useState<PortfolioItem[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [copied, setCopied] = useState(false)
  const mainImgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    portfolioService.getById(id).then(data => {
      setItem(data)
      setSelectedPhoto(0)
    }).catch(() => setItem(null))
    portfolioService.list().then(setAllItems)
  }, [id])

  const related = item
    ? allItems.filter(i => i.id !== item.id && i.category.name === item.category.name).slice(0, 3)
    : []

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waLink = item
    ? `https://wa.me/5511999999999?text=${encodeURIComponent(`Olá! Vi o projeto "${item.title}" no portfólio e gostaria de saber mais.`)}`
    : '#'

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

      {lightbox && item && item.photos.length > 0 && (
        <Lightbox
          src={fileUrl(item.photos[selectedPhoto])}
          alt={`${item.title} — foto ${selectedPhoto + 1}`}
          onClose={() => setLightbox(false)}
        />
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 5% 5rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <BackButton to="/portfolio" label="Portfólio" />
        </div>

        {/* ── States ── */}
        {item === undefined ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr min(400px,100%)', gap: '2.5rem' }} className="lg:grid-detail">
            {/* skeleton */}
            <div style={{ borderRadius: 16, background: '#0c1219', aspectRatio: '4/3' }} className="animate-pulse" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[80, 40, 60, 120].map((w, i) => (
                <div key={i} style={{ height: i === 3 ? 140 : 20, width: `${w}%`, borderRadius: 8, background: '#0c1219' }} className="animate-pulse" />
              ))}
            </div>
          </div>
        ) : item === null ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '1.1rem', color: '#8899aa' }}>Item não encontrado.</p>
            <button onClick={() => navigate('/portfolio')} style={{ marginTop: 16, color: '#22d3ee', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              ← Voltar ao portfólio
            </button>
          </div>
        ) : (
          <>
            {/* ── Detail grid ── */}
            <Reveal>
            <div className="pf-detail-grid" style={{ display: 'grid', gap: '2.5rem', marginBottom: '4rem' }}>

              {/* Left — Gallery */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Main image */}
                <div
                  ref={mainImgRef}
                  onClick={() => item.photos.length > 0 && setLightbox(true)}
                  style={{
                    position: 'relative', borderRadius: 16, overflow: 'hidden',
                    background: '#0c1219', border: '1px solid rgba(56,189,248,.08)',
                    flex: 1, minHeight: 280,
                    cursor: item.photos.length > 0 ? 'zoom-in' : 'default',
                    marginBottom: 12,
                  }}
                >
                  {item.photos.length > 0 ? (
                    <>
                      <img
                        src={fileUrl(item.photos[selectedPhoto])}
                        alt={`${item.title} — foto ${selectedPhoto + 1}`}
                        width={800} height={600}
                        loading="eager" decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', display: 'block' }}
                      />
                      {/* Zoom hint */}
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(0,0,0,.5)', borderRadius: 8,
                        padding: '5px 10px', fontSize: 11, color: '#8899aa',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                        Ampliar
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#3d4f5f', flexDirection: 'column', gap: 8 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                      </svg>
                      <span style={{ fontSize: 13 }}>Fotos em breve</span>
                    </div>
                  )}

                  {/* Badge */}
                  <div style={{
                    position: 'absolute', bottom: 14, left: 14,
                    background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
                    borderRadius: 50, padding: '5px 14px',
                    fontSize: 11, fontWeight: 600, color: '#34d399',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                    Projeto concluído
                  </div>
                </div>

                {/* Thumbnails */}
                {item.photos.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {item.photos.slice(0, 4).map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto(i)}
                        style={{
                          padding: 0, border: `2px solid ${selectedPhoto === i ? '#06b6d4' : 'rgba(56,189,248,.08)'}`,
                          borderRadius: 10, overflow: 'hidden', background: '#0c1219',
                          cursor: 'pointer', aspectRatio: '4/3', transition: 'border-color .2s',
                        }}
                      >
                        <img
                          src={fileUrl(photo)}
                          alt={`${item.title} — thumbnail ${i + 1}`}
                          width={120} height={90}
                          loading="lazy" decoding="async"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right — Info panel */}
              <div className="pf-detail-sticky" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag color="amber">{item.category.name}</Tag>
                  <Tag color="cyan">{item.material}</Tag>
                  <Tag color="emerald">Concluído</Tag>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 700, color: '#e8edf3', lineHeight: 1.25, margin: 0 }}>
                  {item.title}
                </h1>

                {/* Description */}
                {item.description && (
                  <p style={{ fontSize: 14, color: '#8899aa', lineHeight: 1.75, margin: 0 }}>
                    {item.description}
                  </p>
                )}

                {/* Specs card */}
                <div style={{
                  background: '#0c1219', border: '1px solid rgba(56,189,248,.08)',
                  borderRadius: 14, padding: '1.25rem',
                }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#06b6d4', marginBottom: 14 }}>
                    Especificações
                  </p>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem 1.5rem' }}>
                    <div>
                      <dt style={{ fontSize: 11, color: '#556677', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Categoria</dt>
                      <dd style={{ fontSize: 14, color: '#e8edf3', fontWeight: 500 }}>{item.category.name}</dd>
                    </div>
                    <div>
                      <dt style={{ fontSize: 11, color: '#556677', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Material</dt>
                      <dd style={{ fontSize: 14, color: '#e8edf3', fontWeight: 500 }}>{item.material}</dd>
                    </div>
                    {item.complexity && (
                      <div>
                        <dt style={{ fontSize: 11, color: '#556677', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Complexidade</dt>
                        <dd style={{ fontSize: 14, color: '#e8edf3', fontWeight: 500 }}>{item.complexity}</dd>
                      </div>
                    )}
                    {item.printTime != null && (
                      <div>
                        <dt style={{ fontSize: 11, color: '#556677', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Tempo de impressão</dt>
                        <dd style={{ fontSize: 14, color: '#e8edf3', fontWeight: 500 }}>{item.printTime}h</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* CTA card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,.12) 0%, rgba(139,92,246,.1) 100%)',
                  border: '1px solid rgba(6,182,212,.18)',
                  borderRadius: 14, padding: '1.25rem',
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf3', marginBottom: 4 }}>Quer algo parecido?</p>
                  <p style={{ fontSize: 12, color: '#8899aa', marginBottom: '1rem', lineHeight: 1.6 }}>
                    Envie seus arquivos e personalize cada detalhe. Orçamento gratuito em até 24h.
                  </p>
                  <Link
                    to="/quote"
                    state={{ portfolioItem: { id: item.id, title: item.title, material: item.material, photo: item.photos[0] ?? null } }}
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '12px 24px', borderRadius: 50,
                      background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                      color: '#fff', fontSize: 13, fontWeight: 700,
                      letterSpacing: '.5px', textDecoration: 'none',
                      marginBottom: 10,
                    }}
                  >
                    Solicitar orçamento
                  </Link>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px 24px', borderRadius: 50,
                      border: '1px solid rgba(56,189,248,.15)',
                      color: '#8899aa', fontSize: 12, textDecoration: 'none',
                      transition: 'border-color .2s, color .2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(56,189,248,.35)'; (e.currentTarget as HTMLAnchorElement).style.color = '#22d3ee' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(56,189,248,.15)'; (e.currentTarget as HTMLAnchorElement).style.color = '#8899aa' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.529 5.854L0 24l6.332-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.498-5.23-1.37l-.374-.222-3.878.924.988-3.77-.244-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Falar pelo WhatsApp
                  </a>
                </div>

                {/* Share row */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px', borderRadius: 10,
                      background: '#0c1219', border: '1px solid rgba(56,189,248,.08)',
                      color: copied ? '#22d3ee' : '#8899aa',
                      fontSize: 12, cursor: 'pointer', transition: 'all .2s',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                    {copied ? 'Copiado!' : 'Copiar link'}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '10px', borderRadius: 10,
                      background: '#0c1219', border: '1px solid rgba(56,189,248,.08)',
                      color: '#8899aa', fontSize: 12, textDecoration: 'none', transition: 'all .2s',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.555 4.122 1.529 5.854L0 24l6.332-1.51A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.68-.498-5.23-1.37l-.374-.222-3.878.924.988-3.77-.244-.386A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    Compartilhar
                  </a>
                </div>

              </div>
            </div>
            </Reveal>

            {/* ── Related projects ── */}
            {related.length > 0 && (
              <Reveal>
              <section aria-label="Projetos relacionados">
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#06b6d4', marginBottom: 6 }}>
                    Relacionados
                  </p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8edf3' }}>
                    Outros projetos de <span style={{ color: '#22d3ee' }}>{item.category.name}</span>
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  {related.map(r => <RelatedCard key={r.id} item={r} />)}
                </div>
              </section>
              </Reveal>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  )
}