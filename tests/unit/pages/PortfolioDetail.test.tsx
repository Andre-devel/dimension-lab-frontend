import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    getById: vi.fn(),
    list: vi.fn().mockResolvedValue({ content: [], page: 0, size: 9, totalElements: 0, totalPages: 0, hasNext: false }),
  },
}))

vi.mock('@/services/settingsService', () => ({
  settingsService: {
    getAll: vi.fn().mockResolvedValue({ whatsapp_url: '', instagram_url: '', youtube_url: '', whatsapp_admin_number: '', bot_number: '5511999999999' }),
  },
}))

vi.mock('@/components/seo/SEOHead', () => ({
  SEOHead: () => null,
  SITE_URL: 'https://test.com',
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
  photos: ['/uploads/foto1.jpg'],
  modelFile: undefined,
  visible: true,
}

function renderPage() {
  return render(<MemoryRouter><PortfolioDetail /></MemoryRouter>)
}

describe('PortfolioDetail page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading skeleton initially', () => {
    vi.mocked(portfolioService.getById).mockImplementation(() => new Promise(() => {}))
    renderPage()
    // During loading, item title is not yet shown
    expect(screen.queryByText('Suporte para câmera')).not.toBeInTheDocument()
  })

  it('renders item title after loading', async () => {
    vi.mocked(portfolioService.getById).mockResolvedValueOnce(mockItem)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
    })
  })

  it('renders material and category', async () => {
    vi.mocked(portfolioService.getById).mockResolvedValueOnce(mockItem)
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('PLA').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Mecânico').length).toBeGreaterThan(0)
    })
  })

  it('shows "não encontrado" when item not found', async () => {
    vi.mocked(portfolioService.getById).mockRejectedValueOnce(new Error('Not found'))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/não encontrado/i)).toBeInTheDocument()
    })
  })

  it('renders back link to /portfolio', async () => {
    vi.mocked(portfolioService.getById).mockResolvedValueOnce(mockItem)
    renderPage()
    const backLink = screen.getByRole('link', { name: '← Portfólio' })
    expect(backLink).toHaveAttribute('href', '/portfolio')
  })

  it('uses bot_number from settings in WhatsApp link', async () => {
    vi.mocked(portfolioService.getById).mockResolvedValueOnce(mockItem)
    renderPage()
    await waitFor(() => {
      const waLink = screen.getByRole('link', { name: /whatsapp/i })
      expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me/5511999999999'))
    })
  })
})