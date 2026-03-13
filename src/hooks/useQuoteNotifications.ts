import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getUpdatedQuoteIds, saveSeenStatuses } from '@/utils/quoteNotifications'
import type { Quote } from '@/types/quote'

export function useQuoteNotifications(quotes: Quote[]) {
  const { user } = useAuthStore()

  const updatedIds = useMemo(() => {
    if (!user) return new Set<string>()
    return getUpdatedQuoteIds(user.id, quotes)
  }, [user, quotes])

  useMemo(() => {
    if (!user || quotes.length === 0) return
    saveSeenStatuses(user.id, quotes)
  }, [user, quotes])

  return { updatedIds }
}