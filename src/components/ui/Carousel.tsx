import { Link } from 'react-router-dom'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

interface Props {
  items: PortfolioItem[]
}

export function Carousel({ items }: Props) {
  if (items.length === 0) return null

  // Duplicate for infinite loop
  const doubled = [...items, ...items]

  const duration = items.length * 4 // ~4s per card

  return (
    <div
      className="overflow-hidden"
      style={{ position: 'relative' }}
    >
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          width: 'max-content',
          animation: `carouselSlide ${duration}s linear infinite`,
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'
        }}
      >
        {doubled.map((item, idx) => (
          <Link
            key={`${item.id}-${idx}`}
            to={`/portfolio/${item.id}`}
            style={{ width: '256px', flexShrink: 0, textDecoration: 'none' }}
          >
            <div
              className="rounded-card border border-border bg-surface-2 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow group"
            >
              {item.photos.length > 0 ? (
                <img
                  src={fileUrl(item.photos[0])}
                  alt={item.title}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div
                  className="flex items-center justify-center bg-surface"
                  style={{ width: '100%', height: '160px' }}
                >
                  <span className="text-xs text-text-secondary">Sem foto</span>
                </div>
              )}
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
    </div>
  )
}
