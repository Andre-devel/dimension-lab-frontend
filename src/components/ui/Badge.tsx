import type { QuoteStatus } from '@/types/quote'
import { QUOTE_STATUS_LABELS, QUOTE_STATUS_COLORS } from '@/constants/quoteStatus'

interface StatusBadgeProps {
  status: QuoteStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      role="status"
      className="inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${QUOTE_STATUS_COLORS[status]}22`, color: QUOTE_STATUS_COLORS[status] }}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  )
}
