import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PortfolioItemForm from '@/pages/Admin/PortfolioAdmin/PortfolioItemForm'

vi.mock('@/services/catalogService', () => ({
  materialService: {
    listAll: vi.fn().mockResolvedValue([
      { id: 'm1', name: 'PLA', enabled: true },
      { id: 'm2', name: 'PETG', enabled: true },
    ]),
    listActive: vi.fn().mockResolvedValue([]),
  },
  colorService: {
    listAll: vi.fn().mockResolvedValue([]),
    listActive: vi.fn().mockResolvedValue([]),
  },
}))

const mockOnSubmit = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

function renderForm(initialData?: Parameters<typeof PortfolioItemForm>[0]['initialData']) {
  return render(
    <MemoryRouter>
      <PortfolioItemForm onSubmit={mockOnSubmit} initialData={initialData} />
    </MemoryRouter>
  )
}

describe('PortfolioItemForm', () => {
  it('renders required fields', () => {
    renderForm()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/material/i)).toBeInTheDocument()
  })

  it('renders file inputs for photos and model', () => {
    renderForm()
    const fileInputs = document.querySelectorAll('input[type="file"]')
    expect(fileInputs.length).toBe(2)
  })

  it('calls onSubmit with form data when submitted', async () => {
    renderForm()
    await waitFor(() => screen.getByRole('option', { name: 'PLA' }))

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Vaso' } })
    fireEvent.change(screen.getByLabelText(/categoria/i), { target: { value: 'Decorativo' } })
    fireEvent.change(screen.getByLabelText(/material/i), { target: { value: 'PLA' } })

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Vaso',
          categoryName: 'Decorativo',
          material: 'PLA',
        })
      )
    })
  })

  it('does not submit when required fields are empty', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills form when initialData is provided', async () => {
    renderForm({
      id: 'item-1',
      title: 'Vaso Decorativo',
      category: { id: 'cat-1', name: 'Decorativo', slug: 'decorativo' },
      material: 'PLA',
      printTime: 2,
      complexity: 'Fácil',
      photos: ['foto.jpg'],
      visible: true,
    })
    expect(screen.getByDisplayValue('Vaso Decorativo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Decorativo')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByDisplayValue('PLA')).toBeInTheDocument()
    })
  })
})