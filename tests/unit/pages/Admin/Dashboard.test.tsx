import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/quoteService', () => ({
  quoteService: {
    listAll: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

import { quoteService } from '@/services/quoteService'
import AdminDashboard from '@/pages/Admin/Dashboard'

const mockQuotes = [
  {
    id: 'quote-1',
    description: 'Peça mecânica para protótipo industrial de alta precisão',
    material: 'PLA',
    color: 'Branco',
    quantity: 5,
    finish: 'Padrão',
    desiredDeadline: '2026-04-15',
    status: 'RECEIVED' as const,
    createdAt: '2026-03-11T00:00:00Z',
    customer: { id: 'cust-1', name: 'João Silva', email: 'joao@example.com', whatsapp: '11999999999' },
    files: [],
  },
  {
    id: 'quote-2',
    description: 'Suporte para câmera de segurança residencial',
    material: 'PETG',
    color: 'Preto',
    quantity: 2,
    finish: 'Lixado',
    desiredDeadline: '2026-05-01',
    status: 'UNDER_REVIEW' as const,
    createdAt: '2026-03-10T00:00:00Z',
    customer: { id: 'cust-2', name: 'Maria Souza', email: 'maria@example.com' },
    files: [],
  },
]

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AdminDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title "Painel Admin"', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([])
    renderWithRouter(<AdminDashboard />)
    expect(screen.getByText('Painel Admin')).toBeInTheDocument()
  })

  it('shows loading state initially', async () => {
    vi.mocked(quoteService.listAll).mockImplementationOnce(
      () => new Promise(() => {}) // never resolves
    )
    renderWithRouter(<AdminDashboard />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders quotes after loading', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce(mockQuotes)
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Maria Souza').length).toBeGreaterThan(0)
    })
  })

  it('shows customer name and status badge', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce(mockQuotes)
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Recebido').length).toBeGreaterThan(0)
    })
  })

  it('shows "Nenhum orçamento encontrado." when empty', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([])
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getByText('Nenhum orçamento encontrado.')).toBeInTheDocument()
    })
  })

  it('filters quotes by status when filter button clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.listAll).mockResolvedValueOnce(mockQuotes)
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0)
    })
    // Click "Em análise" filter
    await user.click(screen.getByRole('button', { name: 'Em análise' }))
    await waitFor(() => {
      expect(screen.queryAllByText('João Silva').length).toBe(0)
      expect(screen.getAllByText('Maria Souza').length).toBeGreaterThan(0)
    })
  })

  it('"Ver detalhes" links to /admin/quotes/:id', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce(mockQuotes)
    renderWithRouter(<AdminDashboard />)
    await waitFor(() => {
      expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0)
    })
    const links = screen.getAllByRole('link', { name: /Ver detalhes/i })
    expect(links[0]).toHaveAttribute('href', '/admin/quotes/quote-1')
  })
})