import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

const SCROLL_STEP = 180 + 24 // card width + gap

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
            className="pp-card"
            style={{ width: '180px', flexShrink: 0, scrollSnapAlign: 'start', textDecoration: 'none' }}
          >
            <div className="pp-img" style={{ aspectRatio: '9/16' }}>
              {item.photos.length > 0 ? (
                <img
                  src={fileUrl(item.photos[0])}
                  alt={item.title}
                  width={180}
                  height={320}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="flex h-full items-center justify-center" style={{ color: '#3d4f5f' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="pp-body">
              <div className="pp-name">{item.title}</div>
              <div className="pp-tags">
                <span className="pp-tag pp-tag-cat">{item.category.name}</span>
                <span className="pp-tag pp-tag-mat">{item.material}</span>
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