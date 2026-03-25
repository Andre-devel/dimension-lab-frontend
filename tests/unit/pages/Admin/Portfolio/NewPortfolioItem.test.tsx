import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach, describe, it, expect } from 'vitest'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    create: vi.fn(),
  },
}))

vi.mock('@/services/catalogService', () => ({
  materialService: {
    listAll: vi.fn().mockResolvedValue([{ id: 'm1', name: 'PLA', enabled: true }]),
    listActive: vi.fn().mockResolvedValue([{ id: 'm1', name: 'PLA', enabled: true }]),
  },
  colorService: {
    listAll: vi.fn().mockResolvedValue([]),
    listActive: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: vi.fn().mockReturnValue(vi.fn()) }
})

import { portfolioService } from '@/services/portfolioService'
import { useNavigate } from 'react-router-dom'
import NewPortfolioItem from '@/pages/Admin/PortfolioAdmin/NewPortfolioItem'

describe('NewPortfolioItem page', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.clearAllMocks()
  })

  it('renders the form', () => {
    render(<MemoryRouter><NewPortfolioItem /></MemoryRouter>)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
  })

  it('navigates to /admin/portfolio after successful create', async () => {
    vi.mocked(portfolioService.create).mockResolvedValue({
      id: 'new-1',
      title: 'Vaso',
      category: { id: 'c1', name: 'Deco', slug: 'deco' },
      material: 'PLA',
      printTime: null,
      complexity: '',
      photos: [],
      visible: true,
    })

    render(<MemoryRouter><NewPortfolioItem /></MemoryRouter>)
    await waitFor(() => screen.getByRole('option', { name: 'PLA' }))

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Vaso' } })
    fireEvent.change(screen.getByLabelText(/categoria/i), { target: { value: 'Deco' } })
    fireEvent.change(screen.getByLabelText(/material/i), { target: { value: 'PLA' } })
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(portfolioService.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Vaso', categoryName: 'Deco', material: 'PLA' })
      )
      expect(mockNavigate).toHaveBeenCalledWith('/admin/portfolio')
    })
  })
})