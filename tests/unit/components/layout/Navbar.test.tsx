import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, beforeEach } from 'vitest'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))


vi.mock('@/services/authService', () => ({
  authService: {
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  },
}))

import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'
import { Navbar } from '@/components/layout/Navbar'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Navbar', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>)
  })

  it('renders logo "DIMENSION" and ".LAB3D"', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('DIMENSION')).toBeInTheDocument()
    expect(screen.getByText('.LAB3D')).toBeInTheDocument()
  })

  it('renders navigation links Home, Portfólio, Orçamento', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Portfólio')).toBeInTheDocument()
    expect(screen.getByText('Orçamento')).toBeInTheDocument()
  })

  it('hamburger button is present with aria-label "Abrir menu"', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument()
  })

  it('clicking hamburger shows mobile menu', () => {
    renderWithRouter(<Navbar />)
    const hamburger = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(hamburger)
    // mobile menu should show extra nav links
    const allHomeLinks = screen.getAllByText('Home')
    expect(allHomeLinks.length).toBeGreaterThan(0)
    // The mobile menu should be visible
    const mobileMenu = screen.getByRole('navigation', { name: 'Menu mobile' })
    expect(mobileMenu).toBeInTheDocument()
  })

  it('clicking hamburger again hides mobile menu', () => {
    renderWithRouter(<Navbar />)
    const hamburger = screen.getByRole('button', { name: 'Abrir menu' })
    fireEvent.click(hamburger)
    expect(screen.getByRole('navigation', { name: 'Menu mobile' })).toBeInTheDocument()
    fireEvent.click(hamburger)
    expect(screen.queryByRole('navigation', { name: 'Menu mobile' })).not.toBeInTheDocument()
  })

  it('nav links point to correct hrefs', () => {
    renderWithRouter(<Navbar />)
    const homeLinks = screen.getAllByText('Home')
    const portfolioLinks = screen.getAllByText('Portfólio')
    const quoteLinks = screen.getAllByText('Orçamento')

    expect(homeLinks[0].closest('a')).toHaveAttribute('href', '/')
    expect(portfolioLinks[0].closest('a')).toHaveAttribute('href', '/portfolio')
    expect(quoteLinks[0].closest('a')).toHaveAttribute('href', '/quote')
  })

  it('shows "Entrar" link when not authenticated', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('shows "Sair" button and "Meus Orçamentos" link when authenticated as CLIENT', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'u1', email: 'a@b.com', role: 'CLIENT' },
      isAuthenticated: true,
    } as ReturnType<typeof useAuthStore>)
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    expect(screen.getByText('Meus Orçamentos')).toBeInTheDocument()
  })

  it('shows "Admin" link when authenticated as ADMIN', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'u1', email: 'admin@b.com', role: 'ADMIN' },
      isAuthenticated: true,
    } as ReturnType<typeof useAuthStore>)
    renderWithRouter(<Navbar />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('"Entrar" link points to /login', () => {
    renderWithRouter(<Navbar />)
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
  })

})