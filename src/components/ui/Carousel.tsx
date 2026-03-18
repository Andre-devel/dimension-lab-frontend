import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

const SCROLL_STEP = 160 + 24 // card width + gap

interface Props {
  items: PortfolioItem[]
}

export function Carousel({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  function sync() {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.offsetWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [items])

  function scrollBy(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      {/* Track */}
      <div
        ref={trackRef}
        className="carousel-track"
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '4px 5% 12px',
        }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/portfolio/${item.id}`}
            style={{ width: '160px', flexShrink: 0, scrollSnapAlign: 'start', textDecoration: 'none' }}
          >
            <div className="rounded-card border border-border bg-surface-2 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow group">
              <div style={{ width: '100%', aspectRatio: '9/16', overflow: 'hidden' }}>
                {item.photos.length > 0 ? (
                  <img
                    src={fileUrl(item.photos[0])}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface">
                    <span className="text-xs text-text-secondary">Sem foto</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '0.75rem' }}>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors truncate">
                  {item.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">
                    {item.category.name}
                  </span>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">
                    {item.material}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Left arrow */}
      <CarouselArrow
        direction="left"
        visible={canPrev}
        onClick={() => scrollBy(-1)}
        aria-label="Anterior"
      />

      {/* Right arrow */}
      <CarouselArrow
        direction="right"
        visible={canNext}
        onClick={() => scrollBy(1)}
        aria-label="Próximo"
      />
    </div>
  )
}

interface ArrowProps {
  direction: 'left' | 'right'
  visible: boolean
  onClick: () => void
  'aria-label': string
}

function CarouselArrow({ direction, visible, onClick, 'aria-label': label }: ArrowProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="carousel-arrow hidden md:flex items-center justify-center"
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [direction]: '8px',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1px solid rgba(77,159,255,0.35)',
        background: 'rgba(10,10,20,0.75)',
        backdropFilter: 'blur(8px)',
        color: '#4D9FFF',
        cursor: 'pointer',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        zIndex: 10,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(77,159,255,0.9)'
        el.style.boxShadow = '0 0 12px rgba(77,159,255,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(77,159,255,0.35)'
        el.style.boxShadow = 'none'
      }}
    >
      {direction === 'left'
        ? <ChevronLeft size={18} strokeWidth={2} />
        : <ChevronRight size={18} strokeWidth={2} />
      }
    </button>
  )
}