import type { QuoteStatus } from '@/types/quote'

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  RECEIVED:     'Recebido',
  UNDER_REVIEW: 'Em análise',
  APPROVED:     'Aprovado',
  PRINTING:     'Imprimindo',
  READY:        'Pronto',
  DELIVERED:    'Entregue',
  CANCELLED:    'Cancelado',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  RECEIVED:     'rgb(var(--c-accent-blue))',
  UNDER_REVIEW: 'rgb(var(--c-accent-amber))',
  APPROVED:     'rgb(var(--c-accent-purple))',
  PRINTING:     'rgb(var(--c-accent-glow))',
  READY:        'rgb(var(--c-accent-green))',
  DELIVERED:    'rgb(var(--c-status-delivered))',
  CANCELLED:    'rgb(var(--c-text-secondary))',
}

export const MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU', 'Resina'] as const
