import { Link } from 'react-router-dom'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

interface Props {
  item: PortfolioItem
  view: 'grid' | 'list'
  animationDelay?: number
}

export function PortfolioCard({ item, view, animationDelay = 0 }: Props) {
  return (
    <Link
      to={`/portfolio/${item.id}`}
      className="pf-card block"
      style={{ animationDelay: `${animationDelay}s`, textDecoration: 'none' }}
    >
      {/* Image */}
      <div className="pf-card-img">
        {item.photos.length > 0 ? (
          <>
            <img
              src={fileUrl(item.photos[0])}
              alt={item.title}
              width={400}
              height={300}
              loading="lazy"
              decoding="async"
            />
            <div className="pf-card-overlay">
              <button className="pf-overlay-btn" tabIndex={-1}>Ver detalhes</button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-2" style={{ color: 'rgb(var(--c-text-muted))' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontSize: 12 }}>Foto em breve</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: view === 'list' ? '16px 20px' : '14px 16px 16px', flex: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(var(--c-text-bright))', marginBottom: 10, lineHeight: 1.3 }}>
          {item.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          <Tag color="amber">{item.category.name}</Tag>
          <Tag color="cyan">{item.material}</Tag>
          {item.complexity && <Tag>{item.complexity}</Tag>}
          {item.printTime != null && <Tag color="blue">{item.printTime}h</Tag>}
        </div>
      </div>
    </Link>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color?: 'cyan' | 'amber' | 'blue' }) {
  const styles: Record<string, React.CSSProperties> = {
    cyan:  { background: 'rgb(var(--c-accent-teal) / .08)',  borderColor: 'rgb(var(--c-accent-teal) / .15)',  color: 'rgb(var(--c-accent-teal))' },
    amber: { background: 'rgb(var(--c-accent-amber) / .08)', borderColor: 'rgb(var(--c-accent-amber) / .15)', color: 'rgb(var(--c-accent-amber))' },
    blue:  { background: 'rgb(var(--c-accent-blue) / .08)', borderColor: 'rgb(var(--c-accent-blue) / .15)', color: 'rgb(var(--c-accent-blue))' },
  }
  const base: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, letterSpacing: '.3px',
    padding: '3px 9px', borderRadius: 50,
    border: '1px solid rgb(var(--c-accent-teal) / .08)',
    background: 'rgba(255,255,255,.04)',
    color: 'rgb(var(--c-text-secondary))',
    textTransform: 'uppercase',
    ...(color ? styles[color] : {}),
  }
  return <span style={base}>{children}</span>
}