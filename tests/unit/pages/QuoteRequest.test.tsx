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

import { quoteService } from '@/services/quoteService'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('QuoteRequest page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title "Solicitar Orçamento"', () => {
    renderWithRouter(<QuoteRequest />)
    expect(screen.getByText('Solicitar Orçamento')).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    renderWithRouter(<QuoteRequest />)
    expect(screen.getByLabelText('Descrição do projeto')).toBeInTheDocument()
    expect(screen.getByLabelText('Material')).toBeInTheDocument()
    expect(screen.getByLabelText('Cor')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantidade')).toBeInTheDocument()
    expect(screen.getByLabelText('Acabamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Prazo desejado')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu e-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp (com DDD)')).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QuoteRequest />)
    const submitBtn = screen.getByRole('button', { name: /Enviar Orçamento/i })
    await user.click(submitBtn)
    await waitFor(() => {
      expect(screen.getByText('Mínimo 10 caracteres')).toBeInTheDocument()
    })
  })

  it('shows error for description shorter than 10 chars', async () => {
    const user = userEvent.setup()
    renderWithRouter(<QuoteRequest />)
    const descriptionField = screen.getByLabelText('Descrição do projeto')
    await user.type(descriptionField, 'Short')
    const submitBtn = screen.getByRole('button', { name: /Enviar Orçamento/i })
    await user.click(submitBtn)
    await waitFor(() => {
      expect(screen.getByText('Mínimo 10 caracteres')).toBeInTheDocument()
    })
  })

  it('calls quoteService.create with correct data on valid submit', async () => {
    const user = userEvent.setup()
    const mockCreate = vi.mocked(quoteService.create)
    mockCreate.mockResolvedValueOnce({
      id: '1',
      description: 'A valid description here',
      material: 'PLA',
      color: 'Branco',
      quantity: 2,
      finish: 'Padrão',
      desiredDeadline: '2026-04-01',
      status: 'RECEIVED',
      createdAt: '2026-03-11T00:00:00Z',
      files: [],
    })

    renderWithRouter(<QuoteRequest />)

    await user.type(screen.getByLabelText('Descrição do projeto'), 'A valid description here')
    await user.selectOptions(screen.getByLabelText('Material'), 'PLA')
    await user.type(screen.getByLabelText('Cor'), 'Branco')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '2')
    await user.selectOptions(screen.getByLabelText('Acabamento'), 'Padrão')
    await user.type(screen.getByLabelText('Prazo desejado'), '2026-04-01')

    const submitBtn = screen.getByRole('button', { name: /Enviar Orçamento/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'A valid description here',
          material: 'PLA',
          color: 'Branco',
          quantity: 2,
          finish: 'Padrão',
          desiredDeadline: '2026-04-01',
        })
      )
    })
  })

  it('shows success message after successful submit', async () => {
    const user = userEvent.setup()
    const mockCreate = vi.mocked(quoteService.create)
    mockCreate.mockResolvedValueOnce({
      id: '1',
      description: 'A valid description here',
      material: 'PLA',
      color: 'Branco',
      quantity: 2,
      finish: 'Padrão',
      desiredDeadline: '2026-04-01',
      status: 'RECEIVED',
      createdAt: '2026-03-11T00:00:00Z',
      files: [],
    })

    renderWithRouter(<QuoteRequest />)

    await user.type(screen.getByLabelText('Descrição do projeto'), 'A valid description here')
    await user.selectOptions(screen.getByLabelText('Material'), 'PLA')
    await user.type(screen.getByLabelText('Cor'), 'Branco')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '2')
    await user.selectOptions(screen.getByLabelText('Acabamento'), 'Padrão')
    await user.type(screen.getByLabelText('Prazo desejado'), '2026-04-01')

    await user.click(screen.getByRole('button', { name: /Enviar Orçamento/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Orçamento enviado com sucesso! Entraremos em contato em breve.')
      ).toBeInTheDocument()
    })
  })

  it('shows error message when service throws', async () => {
    const user = userEvent.setup()
    const mockCreate = vi.mocked(quoteService.create)
    mockCreate.mockRejectedValueOnce(new Error('Server error'))

    renderWithRouter(<QuoteRequest />)

    await user.type(screen.getByLabelText('Descrição do projeto'), 'A valid description here')
    await user.selectOptions(screen.getByLabelText('Material'), 'PLA')
    await user.type(screen.getByLabelText('Cor'), 'Branco')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '2')
    await user.selectOptions(screen.getByLabelText('Acabamento'), 'Padrão')
    await user.type(screen.getByLabelText('Prazo desejado'), '2026-04-01')

    await user.click(screen.getByRole('button', { name: /Enviar Orçamento/i }))

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao enviar orçamento. Tente novamente.')
      ).toBeInTheDocument()
    })
  })

  it('submit button shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockCreate = vi.mocked(quoteService.create)
    let resolvePromise!: () => void
    mockCreate.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePromise = () =>
            resolve({
              id: '1',
              description: 'A valid description here',
              material: 'PLA',
              color: 'Branco',
              quantity: 2,
              finish: 'Padrão',
              desiredDeadline: '2026-04-01',
              status: 'RECEIVED',
              createdAt: '2026-03-11T00:00:00Z',
              files: [],
            })
        })
    )

    renderWithRouter(<QuoteRequest />)

    await user.type(screen.getByLabelText('Descrição do projeto'), 'A valid description here')
    await user.selectOptions(screen.getByLabelText('Material'), 'PLA')
    await user.type(screen.getByLabelText('Cor'), 'Branco')
    await user.clear(screen.getByLabelText('Quantidade'))
    await user.type(screen.getByLabelText('Quantidade'), '2')
    await user.selectOptions(screen.getByLabelText('Acabamento'), 'Padrão')
    await user.type(screen.getByLabelText('Prazo desejado'), '2026-04-01')

    await user.click(screen.getByRole('button', { name: /Enviar Orçamento/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Enviar Orçamento/i })
      expect(btn).toBeDisabled()
    })

    resolvePromise()

    await waitFor(() => {
      expect(
        screen.getByText('Orçamento enviado com sucesso! Entraremos em contato em breve.')
      ).toBeInTheDocument()
    })
  })
})