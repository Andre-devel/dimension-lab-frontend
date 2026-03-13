import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn().mockReturnValue({ id: 'item-1' }),
    useNavigate: vi.fn().mockReturnValue(vi.fn()),
    MemoryRouter: actual.MemoryRouter,
  }
})

import { MemoryRouter } from 'react-router-dom'
import { portfolioService } from '@/services/portfolioService'
import { useNavigate } from 'react-router-dom'
import EditPortfolioItem from '@/pages/Admin/PortfolioAdmin/EditPortfolioItem'

const mockItem = {
  id: 'item-1',
  title: 'Vaso Decorativo',
  category: { id: 'cat-1', name: 'Decorativo', slug: 'decorativo' },
  material: 'PLA',
  printTime: 2,
  complexity: 'Fácil',
  photos: ['foto.jpg'],
  visible: true,
}

describe('EditPortfolioItem page', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(portfolioService.getById).mockResolvedValue(mockItem)
    vi.clearAllMocks()
    vi.mocked(portfolioService.getById).mockResolvedValue(mockItem)
  })

  it('loads and pre-fills form with existing item', async () => {
    render(<MemoryRouter><EditPortfolioItem /></MemoryRouter>)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Vaso Decorativo')).toBeInTheDocument()
      expect(screen.getByDisplayValue('PLA')).toBeInTheDocument()
    })
  })

  it('navigates to /admin/portfolio after successful update', async () => {
    vi.mocked(portfolioService.update).mockResolvedValue(mockItem)

    render(<MemoryRouter><EditPortfolioItem /></MemoryRouter>)
    await waitFor(() => screen.getByDisplayValue('Vaso Decorativo'))

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(portfolioService.update).toHaveBeenCalledWith('item-1', expect.any(Object))
      expect(mockNavigate).toHaveBeenCalledWith('/admin/portfolio')
    })
  })
})