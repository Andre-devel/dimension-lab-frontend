import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect } from 'vitest'
import PortfolioItemForm from '@/pages/Admin/PortfolioAdmin/PortfolioItemForm'

const mockOnSubmit = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

function renderForm(initialData?: Parameters<typeof PortfolioItemForm>[0]['initialData']) {
  return render(
    <MemoryRouter>
      <PortfolioItemForm onSubmit={mockOnSubmit} />
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

  it('calls onSubmit with form data when submitted', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Vaso' } })
    fireEvent.change(screen.getByLabelText(/categoria/i), { target: { value: 'Decorativo' } })
    fireEvent.change(screen.getByLabelText(/material/i), { target: { value: 'PLA' } })

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Vaso',
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
})