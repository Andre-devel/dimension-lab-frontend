import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/settingsService', () => ({
  settingsService: {
    getAll: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/services/catalogService', () => ({
  materialService: { listActive: vi.fn().mockResolvedValue([]) },
  colorService: { listActive: vi.fn().mockResolvedValue([]) },
}))

import { settingsService } from '@/services/settingsService'
import SettingsAdmin from '@/pages/Admin/SettingsAdmin'

const mockSettings = {
  whatsapp_url: 'https://wa.me/5511999999999',
  instagram_url: 'https://instagram.com/dimensionlab3d',
  youtube_url: '',
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SettingsAdmin />
    </MemoryRouter>,
  )
}

describe('SettingsAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title "Configurações"', async () => {
    vi.mocked(settingsService.getAll).mockResolvedValueOnce(mockSettings)
    renderPage()
    expect(screen.getByText('Configurações')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    vi.mocked(settingsService.getAll).mockImplementationOnce(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renders inputs with current values', async () => {
    vi.mocked(settingsService.getAll).mockResolvedValueOnce(mockSettings)
    renderPage()
    await waitFor(() => {
      expect(screen.getByDisplayValue('https://wa.me/5511999999999')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://instagram.com/dimensionlab3d')).toBeInTheDocument()
    })
  })

  it('saves updated setting on button click', async () => {
    const user = userEvent.setup()
    vi.mocked(settingsService.getAll).mockResolvedValueOnce(mockSettings)
    vi.mocked(settingsService.update).mockResolvedValueOnce({
      key: 'whatsapp_url',
      value: 'https://wa.me/5599999999999',
    })
    renderPage()
    await waitFor(() =>
      expect(screen.getByDisplayValue('https://wa.me/5511999999999')).toBeInTheDocument(),
    )

    const input = screen.getByDisplayValue('https://wa.me/5511999999999')
    await user.clear(input)
    await user.type(input, 'https://wa.me/5599999999999')

    const saveButtons = screen.getAllByRole('button', { name: /salvar/i })
    await user.click(saveButtons[0])

    await waitFor(() =>
      expect(settingsService.update).toHaveBeenCalledWith('whatsapp_url', 'https://wa.me/5599999999999'),
    )
  })

  it('shows success feedback after save', async () => {
    const user = userEvent.setup()
    vi.mocked(settingsService.getAll).mockResolvedValueOnce(mockSettings)
    vi.mocked(settingsService.update).mockResolvedValueOnce({
      key: 'instagram_url',
      value: 'https://instagram.com/dimensionlab3d',
    })
    renderPage()
    await waitFor(() =>
      expect(screen.getByDisplayValue('https://instagram.com/dimensionlab3d')).toBeInTheDocument(),
    )

    const saveButtons = screen.getAllByRole('button', { name: /salvar/i })
    await user.click(saveButtons[1])

    await waitFor(() => expect(screen.getByText(/salvo/i)).toBeInTheDocument())
  })
})
