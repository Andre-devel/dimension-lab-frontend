import type { Quote } from '@/types/quote'

type StatusCache = Record<string, Quote['status']>

const key = (userId: string) => `quote-statuses-${userId}`

export function getSeenStatuses(userId: string): StatusCache {
  try {
    const raw = localStorage.getItem(key(userId))
    return raw ? (JSON.parse(raw) as StatusCache) : {}
  } catch {
    return {}
  }
}

export function saveSeenStatuses(userId: string, quotes: Quote[]): void {
  const cache: StatusCache = {}
  for (const q of quotes) cache[q.id] = q.status
  localStorage.setItem(key(userId), JSON.stringify(cache))
}

export function getUpdatedQuoteIds(userId: string, quotes: Quote[]): Set<string> {
  const seen = getSeenStatuses(userId)
  const updated = new Set<string>()
  for (const q of quotes) {
    if (seen[q.id] !== undefined && seen[q.id] !== q.status) {
      updated.add(q.id)
    }
  }
  return updated
}
