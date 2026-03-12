import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import type { PortfolioItem } from '@/types/portfolio'

interface Props {
  item: PortfolioItem
}

export function PortfolioCard({ item }: Props) {
  return (
    <Link to={`/portfolio/${item.id}`} className="block group">
      <Card hoverable>
        {item.photos.length > 0 ? (
          <img
            src={item.photos[0]}
            alt={item.title}
            className="mb-3 h-40 w-full rounded object-cover"
          />
        ) : (
          <div className="mb-3 h-40 w-full rounded bg-surface-2 flex items-center justify-center">
            <span className="text-xs text-text-secondary">Sem foto</span>
          </div>
        )}

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