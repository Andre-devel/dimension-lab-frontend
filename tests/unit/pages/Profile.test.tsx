import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('@/services/authService', () => ({
  authService: {
    me: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

vi.mock('@/services/catalogService', () => ({
  materialService: { listActive: vi.fn().mockResolvedValue([]) },
  colorService: { listActive: vi.fn().mockResolvedValue([]) },
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import Profile from '@/pages/Profile'

const mockUser = { id: '1', name: 'Alice', email: 'alice@email.com', phone: '11999999999', role: 'CLIENT' as const }
const mockSetUser = vi.fn()

function renderPage() {
  vi.mocked(useAuthStore).mockReturnValue({
    user: mockUser,
    isAuthenticated: true,
    isAuthLoading: false,
    setUser: mockSetUser,
    clearUser: vi.fn(),
    setAuthLoading: vi.fn(),
  })
  return render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>,
  )
}

describe('Profile page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders title "Meu Perfil"', () => {
    renderPage()
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
  })

  it('shows current name and phone in inputs', () => {
    renderPage()
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('11999999999')).toBeInTheDocument()
  })

  it('shows email as read-only', () => {
    renderPage()
    expect(screen.getByDisplayValue('alice@email.com')).toBeInTheDocument()
  })

  it('calls updateProfile on save and updates store', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.updateProfile).mockResolvedValueOnce({
      id: '1',
      name: 'Alice Silva',
      email: 'alice@email.com',
      phone: '11999999999',
      role: 'CLIENT' as const,
    })
    renderPage()

    const nameInput = screen.getByDisplayValue('Alice')
    await user.clear(nameInput)
    await user.type(nameInput, 'Alice Silva')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(authService.updateProfile).toHaveBeenCalledWith('Alice Silva', '11999999999')
      expect(mockSetUser).toHaveBeenCalled()
    })
  })

  it('shows success feedback after save', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.updateProfile).mockResolvedValueOnce({
      id: '1', name: 'Alice', email: 'alice@email.com', phone: '11999999999', role: 'CLIENT' as const,
    })
    renderPage()

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => expect(screen.getByText(/salvo/i)).toBeInTheDocument())
  })

  it('shows error message when save fails', async () => {
    const user = userEvent.setup()
    vi.mocked(authService.updateProfile).mockRejectedValueOnce(new Error('fail'))
    renderPage()

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => expect(screen.getByText(/erro/i)).toBeInTheDocument())
  })
})
