import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    listAll: vi.fn(),
    toggleVisibility: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' },
    isAuthenticated: true,
  }),
}))

import { portfolioService } from '@/services/portfolioService'
import PortfolioAdmin from '@/pages/Admin/PortfolioAdmin'

const mockItems = [
  {
    id: 'item-1',
    title: 'Vaso Decorativo',
    category: { id: 'cat-1', name: 'Decorativo', slug: 'decorativo' },
    material: 'PLA',
    printTime: 2,
    complexity: 'Fácil',
    photos: ['foto.jpg'],
    visible: true,
  },
  {
    id: 'item-2',
    title: 'Engrenagem',
    category: { id: 'cat-2', name: 'Mecânico', slug: 'mecanico' },
    material: 'PETG',
    printTime: null,
    complexity: 'Difícil',
    photos: [],
    visible: false,
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <PortfolioAdmin />
    </MemoryRouter>
  )
}

describe('PortfolioAdmin page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(portfolioService.listAll).mockResolvedValue(mockItems)
  })

  it('shows loading state initially', () => {
    renderPage()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders all items including hidden after load', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Vaso Decorativo').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Engrenagem').length).toBeGreaterThan(0)
    })
  })

  it('shows visibility indicator for hidden items', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Oculto').length).toBeGreaterThan(0)
    })
  })

  it('shows "Novo Item" link', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /novo item/i })).toBeInTheDocument()
    })
  })

  it('calls toggleVisibility when toggle button is clicked', async () => {
    vi.mocked(portfolioService.toggleVisibility).mockResolvedValue({ ...mockItems[0], visible: false })
    renderPage()
    await waitFor(() => screen.getAllByText('Vaso Decorativo'))

    const toggleButtons = screen.getAllByTitle(/ocultar|exibir/i)
    fireEvent.click(toggleButtons[0])

    await waitFor(() => {
      expect(portfolioService.toggleVisibility).toHaveBeenCalledWith('item-1', false)
    })
  })

  it('calls remove after delete confirmation', async () => {
    vi.mocked(portfolioService.remove).mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage()
    await waitFor(() => screen.getAllByText('Vaso Decorativo'))

    const deleteButtons = screen.getAllByTitle('Excluir')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(portfolioService.remove).toHaveBeenCalledWith('item-1')
    })
  })

  it('does NOT call remove when confirm is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderPage()
    await waitFor(() => screen.getAllByText('Vaso Decorativo'))

    const deleteButtons = screen.getAllByTitle('Excluir')
    fireEvent.click(deleteButtons[0])

    expect(portfolioService.remove).not.toHaveBeenCalled()
  })
})