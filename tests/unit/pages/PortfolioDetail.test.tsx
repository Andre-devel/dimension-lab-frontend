import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    list: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ id: 'item-1' }) }
})

import { portfolioService } from '@/services/portfolioService'
import PortfolioDetail from '@/pages/PortfolioDetail'

const mockItem = {
  id: 'item-1',
  title: 'Suporte para câmera',
  category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
  material: 'PLA',
  printTime: 3,
  complexity: 'Médio',
  photos: ['foto1.jpg'],
  modelFile: undefined,
  visible: true,
}

function renderPage() {
  return render(<MemoryRouter><PortfolioDetail /></MemoryRouter>)
}

describe('PortfolioDetail page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    vi.mocked(portfolioService.list).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('renders item title after loading', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce([mockItem])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
    })
  })

  it('renders material and category', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce([mockItem])
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('PLA').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Mecânico').length).toBeGreaterThan(0)
    })
  })

  it('shows "não encontrado" when item not in list', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument()
    })
  })

  it('renders back link to /portfolio', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce([mockItem])
    renderPage()
    const backLink = screen.getByRole('link', { name: /voltar/i })
    expect(backLink).toHaveAttribute('href', '/portfolio')
  })
})