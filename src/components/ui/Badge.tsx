import type { QuoteStatus } from '@/types/quote'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/constants/quoteStatus'

interface StatusBadgeProps {
  status: QuoteStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = QUOTE_STATUS_COLORS[status]
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-badge px-2.5 py-1 text-xs font-semibold tracking-wide"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {QUOTE_STATUS_LABELS[status]}
    </span>
  )
}