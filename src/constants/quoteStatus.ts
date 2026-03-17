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
  RECEIVED:     '#4D9FFF',
  UNDER_REVIEW: '#F59E0B',
  APPROVED:     '#8B5CF6',
  PRINTING:     '#2563EB',
  READY:        '#10B981',
  DELIVERED:    '#4A4A6A',
  CANCELLED:    '#6B7280',
}

export const MATERIALS = ['PLA', 'ABS', 'PETG', 'TPU', 'Resina'] as const
export const FINISHES  = ['Padrão', 'Lixado', 'Pintado', 'Cromado'] as const
