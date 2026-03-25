import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { BackButton } from '@/components/ui/BackButton'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('BackButton', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders as a link when "to" prop is provided', () => {
    render(<MemoryRouter><BackButton to="/admin" label="Dashboard" /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('renders as a button when "to" is not provided', () => {
    render(<MemoryRouter><BackButton /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
  })

  it('calls navigate(-1) when button is clicked', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><BackButton /></MemoryRouter>)
    await user.click(screen.getByRole('button', { name: /voltar/i }))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('uses default label "Voltar"', () => {
    render(<MemoryRouter><BackButton /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
  })
})
