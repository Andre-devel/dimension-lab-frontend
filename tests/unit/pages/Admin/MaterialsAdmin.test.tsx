import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/catalogService', () => ({
  materialService: {
    listActive: vi.fn().mockResolvedValue([]),
    listAll: vi.fn(),
    create: vi.fn(),
    toggle: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  colorService: {
    listActive: vi.fn().mockResolvedValue([]),
  },
}))

import { materialService } from '@/services/catalogService'
import MaterialsAdmin from '@/pages/Admin/CatalogAdmin/MaterialsAdmin'

const mockMaterials = [
  { id: '1', name: 'PLA', enabled: true },
  { id: '2', name: 'ABS', enabled: false },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <MaterialsAdmin />
    </MemoryRouter>,
  )
}

describe('MaterialsAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title "Materiais"', async () => {
    vi.mocked(materialService.listAll).mockResolvedValueOnce([])
    renderPage()
    expect(screen.getByText('Materiais')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    vi.mocked(materialService.listAll).mockImplementationOnce(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders materials after loading', async () => {
    vi.mocked(materialService.listAll).mockResolvedValueOnce(mockMaterials)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('PLA')).toBeInTheDocument()
      expect(screen.getByText('ABS')).toBeInTheDocument()
    })
  })

  it('creates a new material', async () => {
    const user = userEvent.setup()
    vi.mocked(materialService.listAll).mockResolvedValueOnce([])
    vi.mocked(materialService.create).mockResolvedValueOnce({ id: '3', name: 'TPU', enabled: true })
    renderPage()
    await waitFor(() => expect(screen.queryByText('Carregando...')).not.toBeInTheDocument())

    await user.type(screen.getByPlaceholderText('Nome do material'), 'TPU')
    await user.click(screen.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => expect(screen.getByText('TPU')).toBeInTheDocument())
  })

  it('enters edit mode when edit button clicked', async () => {
    const user = userEvent.setup()
    vi.mocked(materialService.listAll).mockResolvedValueOnce(mockMaterials)
    renderPage()
    await waitFor(() => expect(screen.getByText('PLA')).toBeInTheDocument())

    const editButtons = screen.getAllByRole('button', { name: /editar/i })
    await user.click(editButtons[0])

    expect(screen.getByDisplayValue('PLA')).toBeInTheDocument()
  })

  it('saves edited material name', async () => {
    const user = userEvent.setup()
    vi.mocked(materialService.listAll).mockResolvedValueOnce(mockMaterials)
    vi.mocked(materialService.update).mockResolvedValueOnce({ id: '1', name: 'PLA+', enabled: true })
    renderPage()
    await waitFor(() => expect(screen.getByText('PLA')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /editar/i })[0])
    const input = screen.getByDisplayValue('PLA')
    await user.clear(input)
    await user.type(input, 'PLA+')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(materialService.update).toHaveBeenCalledWith('1', 'PLA+')
      expect(screen.getByText('PLA+')).toBeInTheDocument()
    })
  })

  it('removes a material', async () => {
    const user = userEvent.setup()
    vi.mocked(materialService.listAll).mockResolvedValueOnce(mockMaterials)
    vi.mocked(materialService.remove).mockResolvedValueOnce(undefined)
    renderPage()
    await waitFor(() => expect(screen.getByText('PLA')).toBeInTheDocument())

    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(materialService.remove).toHaveBeenCalledWith('1')
      expect(screen.queryByText('PLA')).not.toBeInTheDocument()
    })
  })

  it('shows error when delete fails due to linked quotes', async () => {
    const user = userEvent.setup()
    vi.mocked(materialService.listAll).mockResolvedValueOnce(mockMaterials)
    vi.mocked(materialService.remove).mockRejectedValueOnce({
      response: { status: 409 },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('PLA')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: /excluir/i })[0])

    await waitFor(() =>
      expect(screen.getByText(/orçamentos vinculados/i)).toBeInTheDocument(),
    )
  })
})