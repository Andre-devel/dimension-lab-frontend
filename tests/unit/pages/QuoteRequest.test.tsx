import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import QuoteRequest from '@/pages/QuoteRequest'

vi.mock('@/services/quoteService', () => ({
  quoteService: {
    create: vi.fn(),
  },
}))

vi.mock('@/services/catalogService', () => ({
  materialService: { listActive: vi.fn().mockResolvedValue([]) },
  colorService:    { listActive: vi.fn().mockResolvedValue([]) },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    isAuthenticated: false,
    user: null,
    setUser: vi.fn(),
  }),
}))

vi.mock('@/components/seo/SEOHead', () => ({
  SEOHead: () => null,
  SITE_URL: 'https://test.com',
}))

import { quoteService } from '@/services/quoteService'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

/** Fill the minimum valid form: description + color + contact. */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Descrição do projeto'), 'A valid description here')
  // 'Multicor' is always available (hardcoded first option)
  await user.click(screen.getByRole('button', { name: 'Multicor' }))
  await user.type(screen.getByLabelText('Seu nome'), 'Test User')
  await user.type(screen.getByLabelText('E-mail'), 'test@test.com')
  await user.type(screen.getByLabelText(/Telefone/i), '(11) 99999-9999')
}

describe('QuoteRequest page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title "Solicitar Orçamento"', () => {
    renderWithRouter(<QuoteRequest />)
    expect(screen.getByText('Solicitar Orçamento')).toBeInTheDocument()
  })

  it('renders required form fields', () => {
    renderWithRouter(<QuoteRequest />)
    expect(screen.getByLabelText('Descrição do projeto')).toBeInTheDocument()
    expect(screen.getByLabelText(/Quantidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument()
  })

  it('shows validation error when description is too short', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QuoteRequest />)
    // Select color so zod validation passes, then submit with short description
    await user.click(screen.getByRole('button', { name: 'Multicor' }))
    await user.type(screen.getByLabelText('Descrição do projeto'), 'Short')
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))
    await waitFor(() => {
      expect(screen.getByText('A descrição precisa ter pelo menos 10 caracteres.')).toBeInTheDocument()
    })
  })

  it('shows validation error when submitting without description', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QuoteRequest />)
    // Select color so zod validation passes, then submit with empty description
    await user.click(screen.getByRole('button', { name: 'Multicor' }))
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))
    await waitFor(() => {
      expect(screen.getByText('Informe uma descrição ou envie pelo menos um arquivo do projeto.')).toBeInTheDocument()
    })
  })

  it('calls quoteService.create with correct data on valid submit', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.create).mockResolvedValueOnce({
      id: '1',
      description: 'A valid description here',
      material: 'PLA',
      color: 'Multicor',
      quantity: 1,
      finish: '',
      desiredDeadline: '',
      status: 'RECEIVED',
      createdAt: '2026-03-11T00:00:00Z',
      files: [],
    } as any)

    renderWithRouter(<QuoteRequest />)
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))

    await waitFor(() => {
      expect(vi.mocked(quoteService.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'A valid description here',
          color: 'Multicor',
          material: 'PLA',
        })
      )
    })
  })

  it('shows success message after successful submit', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.create).mockResolvedValueOnce({
      id: '1',
      description: 'A valid description here',
      material: 'PLA',
      color: 'Multicor',
      quantity: 1,
      finish: '',
      desiredDeadline: '',
      status: 'RECEIVED',
      createdAt: '2026-03-11T00:00:00Z',
      files: [],
    } as any)

    renderWithRouter(<QuoteRequest />)
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))

    await waitFor(() => {
      expect(screen.getByText('Orçamento enviado!')).toBeInTheDocument()
      expect(screen.getByText('Entraremos em contato em breve.')).toBeInTheDocument()
    })
  })

  it('shows error message when service throws', async () => {
    const user = userEvent.setup()
    vi.mocked(quoteService.create).mockRejectedValueOnce(new Error('Server error'))

    renderWithRouter(<QuoteRequest />)
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))

    await waitFor(() => {
      expect(screen.getByText('Erro ao enviar orçamento. Tente novamente.')).toBeInTheDocument()
    })
  })

  it('submit button is disabled during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise!: () => void
    vi.mocked(quoteService.create).mockImplementationOnce(
      () => new Promise((resolve) => {
        resolvePromise = () => resolve({
          id: '1', description: 'A valid description here',
          material: 'PLA', color: 'Multicor', quantity: 1,
          finish: '', desiredDeadline: '', status: 'RECEIVED',
          createdAt: '2026-03-11T00:00:00Z', files: [],
        } as any)
      })
    )

    renderWithRouter(<QuoteRequest />)
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /Enviar orçamento/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Enviando/i })).toBeDisabled()
    })

    resolvePromise()

    await waitFor(() => {
      expect(screen.getByText('Orçamento enviado!')).toBeInTheDocument()
    })
  })
})
