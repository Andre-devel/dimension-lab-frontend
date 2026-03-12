import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    list: vi.fn(),
  },
}))

import { portfolioService } from '@/services/portfolioService'
import Portfolio from '@/pages/Portfolio'

const mockItems = [
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

function renderPage() {
  return render(<MemoryRouter><Portfolio /></MemoryRouter>)
}

describe('Portfolio page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading state initially', () => {
    vi.mocked(portfolioService.list).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })

  it('renders all items after loading', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce(mockItems)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })

  it('shows empty message when no items', async () => {
    vi.mocked(portfolioService.list).mockResolvedValueOnce([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/nenhum item/i)).toBeInTheDocument()
    })
  })

  it('filters items by material', async () => {
    const user = userEvent.setup()
    vi.mocked(portfolioService.list).mockResolvedValueOnce(mockItems)
    renderPage()
    await waitFor(() => expect(screen.getByText('Suporte para câmera')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'PETG' }))
    await waitFor(() => {
      expect(screen.queryByText('Suporte para câmera')).not.toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })

  it('clears filter when "Todos" is clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(portfolioService.list).mockResolvedValueOnce(mockItems)
    renderPage()
    await waitFor(() => expect(screen.getByText('Suporte para câmera')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'PETG' }))
    await user.click(screen.getByRole('button', { name: 'Todos' }))
    await waitFor(() => {
      expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
      expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
    })
  })
})