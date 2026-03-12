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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: 'quote-1' }) }
})

import { quoteService } from '@/services/quoteService'
import AdminQuoteDetail from '@/pages/Admin/QuoteDetail'

const mockQuote = {
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
  files: [
    { id: 'file-1', filePath: 'uploads/model.stl', fileType: 'MODEL_3D' as const },
  ],
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AdminQuoteDetail page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Detalhes do Orçamento" heading', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    renderWithRouter(<AdminQuoteDetail />)
    expect(screen.getByText('Detalhes do Orçamento')).toBeInTheDocument()
  })

  it('shows back link "← Voltar" to /admin', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    renderWithRouter(<AdminQuoteDetail />)
    const backLink = screen.getByRole('link', { name: /← Voltar/i })
    expect(backLink).toHaveAttribute('href', '/admin')
  })

  it('shows quote description after loading', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByText('Peça mecânica para protótipo industrial de alta precisão')).toBeInTheDocument()
    })
  })

  it('shows customer name', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })
  })

  it('shows status update select and save button', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument()
    })
  })

  it('calls updateStatus when save is clicked with new status', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    vi.mocked(quoteService.updateStatus).mockResolvedValueOnce({
      ...mockQuote,
      status: 'UNDER_REVIEW',
    })
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByRole('combobox'), 'UNDER_REVIEW')
    await user.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(vi.mocked(quoteService.updateStatus)).toHaveBeenCalledWith('quote-1', 'UNDER_REVIEW')
    })
  })

  it('shows success message after update', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([mockQuote])
    vi.mocked(quoteService.updateStatus).mockResolvedValueOnce({
      ...mockQuote,
      status: 'APPROVED',
    })
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByRole('combobox'), 'APPROVED')
    await user.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(screen.getByText('Status atualizado com sucesso!')).toBeInTheDocument()
    })
  })

  it('shows "Orçamento não encontrado." when quote not found', async () => {
    vi.mocked(quoteService.listAll).mockResolvedValueOnce([])
    renderWithRouter(<AdminQuoteDetail />)
    await waitFor(() => {
      expect(screen.getByText('Orçamento não encontrado.')).toBeInTheDocument()
    })
  })
})