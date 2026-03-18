import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import type { PortfolioItem } from '@/types/portfolio'
import { fileUrl } from '@/utils/fileUrl'

interface Props {
  item: PortfolioItem
}

export function PortfolioCard({ item }: Props) {
  return (
    <Link to={`/portfolio/${item.id}`} className="block group">
      <Card hoverable>
        <div className="mb-3 w-full rounded overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '260px' }}>
          {item.photos.length > 0 ? (
            <img
              src={fileUrl(item.photos[0])}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface-2 flex items-center justify-center">
              <span className="text-xs text-text-secondary">Sem foto</span>
            </div>
          )}
        </div>

        <h3 className="font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
          {item.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-secondary">
            {item.category.name}
          </span>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-secondary">
            {item.material}
          </span>
          {item.complexity && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-secondary">
              {item.complexity}
            </span>
          )}
          {item.printTime != null && (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-secondary">
              {item.printTime}h
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}