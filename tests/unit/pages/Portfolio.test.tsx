import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    list: vi.fn(),
    listCategories: vi.fn(),
  },
}))

vi.mock('@/components/seo/SEOHead', () => ({
  SEOHead: () => null,
  SITE_URL: 'https://test.com',
}))

import { portfolioService } from '@/services/portfolioService'
import type { PagedResponse } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import Portfolio from '@/pages/Portfolio'

const mockItems: PortfolioItem[] = [
  {
    id: 'item-1',
    title: 'Suporte para câmera',
    category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
    material: 'PLA',
    printTime: 3,
    complexity: 'Médio',
    photos: [],
    visible: true,
  },
  {
    id: 'item-2',
    title: 'Vaso decorativo',
    category: { id: 'cat-2', name: 'Decorativo', slug: 'decorativo' },
    material: 'PETG',
    printTime: 5,
    complexity: 'Fácil',
    photos: [],
    visible: true,
  },
]

function pagedResponse(items: PortfolioItem[], total?: number): PagedResponse<PortfolioItem> {
  return {
    content: items,
    page: 0,
    size: 9,
    totalElements: total ?? items.length,
    totalPages: 1,
    hasNext: false,
  }
}

function renderPage() {
  return render(<MemoryRouter><Portfolio /></MemoryRouter>)
}

describe('Portfolio page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading skeleton initially', () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue([])
    vi.mocked(portfolioService.list).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.queryByText('Suporte para câmera')).not.toBeInTheDocument()
    expect(screen.queryByText('Vaso decorativo')).not.toBeInTheDocument()
  })

  it('renders all items after loading', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue([])
    vi.mocked(portfolioService.list).mockResolvedValue(pagedResponse(mockItems))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })

  it('shows empty message when no items', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue([])
    vi.mocked(portfolioService.list).mockResolvedValue(pagedResponse([]))
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/nenhum projeto encontrado/i)).toBeInTheDocument()
    })
  })

  it('re-fetches from server with category param when category is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(portfolioService.listCategories).mockResolvedValue([
      { name: 'Mecânico', count: 1 },
      { name: 'Decorativo', count: 1 },
    ])
    vi.mocked(portfolioService.list)
      .mockResolvedValueOnce(pagedResponse(mockItems, 2))
      .mockResolvedValueOnce(pagedResponse([mockItems[1]], 1))

    renderPage()
    await waitFor(() => expect(screen.getByText('Suporte para câmera')).toBeInTheDocument())

    // click first matching button (mobile bar renders first in DOM)
    await user.click(screen.getAllByRole('button', { name: /^Decorativo/ })[0])

    await waitFor(() => {
      expect(vi.mocked(portfolioService.list)).toHaveBeenCalledWith(0, 9, 'Decorativo')
    })
    await waitFor(() => {
      expect(screen.queryByText('Suporte para câmera')).not.toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })

  it('re-fetches without category param when Todos is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(portfolioService.listCategories).mockResolvedValue([
      { name: 'Mecânico', count: 1 },
    ])
    vi.mocked(portfolioService.list)
      .mockResolvedValueOnce(pagedResponse(mockItems, 2))
      .mockResolvedValueOnce(pagedResponse([mockItems[0]], 1))
      .mockResolvedValueOnce(pagedResponse(mockItems, 2))

    renderPage()
    await waitFor(() => expect(screen.getByText('Suporte para câmera')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /^Mecânico/ })[0])
    await waitFor(() => expect(screen.getByText('Suporte para câmera')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /^Todos/ })[0])
    await waitFor(() => {
      expect(vi.mocked(portfolioService.list)).toHaveBeenCalledWith(0, 9, undefined)
    })
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })
})