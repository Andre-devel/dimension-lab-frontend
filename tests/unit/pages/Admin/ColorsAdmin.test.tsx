import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/catalogService', () => ({
  materialService: {
    listActive: vi.fn().mockResolvedValue([]),
  },
  colorService: {
    listActive: vi.fn().mockResolvedValue([]),
    listAll: vi.fn(),
    create: vi.fn(),
    toggle: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

import { colorService } from '@/services/catalogService'
import ColorsAdmin from '@/pages/Admin/CatalogAdmin/ColorsAdmin'

const mockColors = [
  { id: '1', name: 'Azul', hex: '#2563EB', enabled: true },
  { id: '2', name: 'Cinza', hex: '#6B7280', enabled: false },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <ColorsAdmin />
    </MemoryRouter>,
  )
}

describe('ColorsAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title "Cores"', async () => {
    vi.mocked(colorService.listAll).mockResolvedValueOnce([])
    renderPage()
    expect(screen.getByText('Cores')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    vi.mocked(colorService.listAll).mockImplementationOnce(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders colors after loading', async () => {
    vi.mocked(colorService.listAll).mockResolvedValueOnce(mockColors)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Azul')).toBeInTheDocument()
      expect(screen.getByText('Cinza')).toBeInTheDocument()
    })
  })

  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(colorService.listAll).mockResolvedValueOnce(mockColors)
    renderPage()
    await waitFor(() => expect(screen.getByText('Azul')).toBeInTheDocument())

    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    await user.click(editButtons[0])

    expect(screen.getByDisplayValue('Azul')).toBeInTheDocument()
  })

  it('saves edited color name and hex', async () => {
    const user = userEvent.setup()
    vi.mocked(colorService.listAll).mockResolvedValueOnce(mockColors)
    vi.mocked(colorService.update).mockResolvedValueOnce({ id: '1', name: 'Crimson', hex: '#DC143C', enabled: true })
    renderPage()
    await waitFor(() => expect(screen.getByText('Azul')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0])
    const nameInput = screen.getByDisplayValue('Azul')
    await user.clear(nameInput)
    await user.type(nameInput, 'Crimson')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(colorService.update).toHaveBeenCalledWith('1', 'Crimson', '#2563EB')
      expect(screen.getByText('Crimson')).toBeInTheDocument()
    })
  })

  it('removes a color', async () => {
    const user = userEvent.setup()
    vi.mocked(colorService.listAll).mockResolvedValueOnce(mockColors)
    vi.mocked(colorService.remove).mockResolvedValueOnce(undefined)
    renderPage()
    await waitFor(() => expect(screen.getByText('Azul')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /excluir/i })[0])

    await waitFor(() => {
      expect(colorService.remove).toHaveBeenCalledWith('1')
      expect(screen.queryByText('Azul')).not.toBeInTheDocument()
    })
  })

  it('shows error when delete fails due to linked quotes', async () => {
    const user = userEvent.setup()
    vi.mocked(colorService.listAll).mockResolvedValueOnce(mockColors)
    vi.mocked(colorService.remove).mockRejectedValueOnce({
      response: { status: 409 },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('Azul')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /excluir/i })[0])

    await waitFor(() =>
      expect(screen.getByText(/orçamentos vinculados/i)).toBeInTheDocument(),
    )
  })
})