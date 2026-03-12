import { create } from 'zustand'
import type { Quote } from '@/types/quote'

interface QuoteState {
  quotes: Quote[]
  setQuotes: (quotes: Quote[]) => void
  addQuote: (quote: Quote) => void
  updateQuote: (updated: Quote) => void
}

export const useQuoteStore = create<QuoteState>((set) => ({
  quotes: [],
  setQuotes: (quotes) => set({ quotes }),
  addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
  updateQuote: (updated) =>
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === updated.id ? updated : q)),
    })),
}))
