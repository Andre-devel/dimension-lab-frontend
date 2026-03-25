import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('@/services/quoteService', () => ({
  quoteService: {
    listMine: vi.fn(),
  },
}))

vi.mock('@/hooks/useQuoteNotifications', () => ({
  useQuoteNotifications: vi.fn(() => ({ updatedIds: new Set<string>() })),
}))

import { quoteService } from '@/services/quoteService'
import { useQuoteNotifications } from '@/hooks/useQuoteNotifications'
import MyQuotes from '@/pages/MyQuotes'

const mockQuotes = [
  {
    id: 'quote-1',
    description: 'Figurinha de dragão',
    material: 'PLA',
    color: 'Azul',
    quantity: 1,
    finish: 'Padrão',
    desiredDeadline: '2026-04-01',
    status: 'RECEIVED' as const,
    createdAt: '2026-03-01T10:00:00Z',
    files: [],
  },
  {
    id: 'quote-2',
    description: 'Suporte para câmera',
    material: 'PETG',
    color: 'Preto',
    quantity: 2,
    finish: 'Lixado',
    desiredDeadline: '2026-05-01',
    status: 'PRINTING' as const,
    createdAt: '2026-03-02T10:00:00Z',
    files: [],
  },
]

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('MyQuotes page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders page title "Meus Orçamentos"', () => {
    vi.mocked(quoteService.listMine).mockImplementation(() => new Promise(() => {}))
    renderWithRouter(<MyQuotes />)
    expect(screen.getByText('Meus Orçamentos')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    vi.mocked(quoteService.listMine).mockImplementation(() => new Promise(() => {}))
    renderWithRouter(<MyQuotes />)
    expect(screen.getByText('Carregando orçamentos…')).toBeInTheDocument()
  })

  it('renders quote descriptions after loading', async () => {
    vi.mocked(quoteService.listMine).mockResolvedValue(mockQuotes)
    renderWithRouter(<MyQuotes />)
    await waitFor(() => {
      expect(screen.getByText('Figurinha de dragão')).toBeInTheDocument()
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
    })
  })

  it('shows status badge for each quote', async () => {
    vi.mocked(quoteService.listMine).mockResolvedValue(mockQuotes)
    renderWithRouter(<MyQuotes />)
    await waitFor(() => {
      expect(screen.getByText('Recebido')).toBeInTheDocument()
      expect(screen.getByText('Imprimindo')).toBeInTheDocument()
    })
  })

  it('shows empty message when no quotes', async () => {
    vi.mocked(quoteService.listMine).mockResolvedValue([])
    renderWithRouter(<MyQuotes />)
    await waitFor(() => {
      expect(screen.getByText('Nenhum orçamento ainda')).toBeInTheDocument()
    })
  })

  it('shows "Atualizado" badge for quotes with changed status', async () => {
    vi.mocked(quoteService.listMine).mockResolvedValue(mockQuotes)
    vi.mocked(useQuoteNotifications).mockReturnValue({ updatedIds: new Set(['quote-1']) })
    renderWithRouter(<MyQuotes />)
    await waitFor(() => {
      expect(screen.getByText('Atualizado')).toBeInTheDocument()
    })
  })

  it('shows material and quantity info', async () => {
    vi.mocked(quoteService.listMine).mockResolvedValue(mockQuotes)
    renderWithRouter(<MyQuotes />)
    await waitFor(() => {
      expect(screen.getByText('1x')).toBeInTheDocument()
      expect(screen.getByText('2x')).toBeInTheDocument()
    })
  })
})