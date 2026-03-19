import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Portfólio', to: '/portfolio' },
  { label: 'Orçamento', to: '/quote' },
]

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? 'text-accent-blue font-medium transition-colors'
    : 'text-text-secondary hover:text-text-primary transition-colors'
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, clearUser } = useAuthStore()
  const navigate = useNavigate()

  const authLink = isAuthenticated
    ? user?.role === 'ADMIN'
      ? { label: 'Admin', to: '/admin' }
      : { label: 'Meus Orçamentos', to: '/my-quotes' }
    : null

  const navLinks = authLink ? [...publicLinks, authLink] : publicLinks

  async function handleLogout() {
    await authService.logout()
    clearUser()
    navigate('/')
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] py-[18px] bg-background/85 backdrop-blur-md border-b border-accent-blue/15"
    >
      {/* Logo */}
      <NavLink to="/" aria-label="Dimension.Lab3D — Página inicial" className="flex items-baseline gap-0 font-heading">
        <span className="font-bold text-text-primary">DIMENSION</span>
        <span className="text-accent-blue">.LAB3D</span>
      </NavLink>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-7">
        {navLinks.map(({ label, to }) => (
          <li key={to}>
            <NavLink to={to} className={linkClass} end={to === '/'}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Desktop CTA + auth + hamburger */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-accent-blue px-[22px] py-[9px] text-sm font-semibold text-accent-blue transition-all hover:bg-accent-blue/10"
          >
            Sair
          </button>
        ) : (
          <>
            <NavLink
              to="/login"
              className="rounded-full border border-accent-blue px-[22px] py-[9px] text-sm font-semibold text-accent-blue transition-all hover:bg-accent-blue/10"
            >
              Entrar
            </NavLink>
            <NavLink
              to="/quote"
              className="hidden md:inline-flex rounded-full bg-accent-blue px-[22px] py-[9px] text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              Pedir Orçamento
            </NavLink>
          </>
        )}

        {/* Hamburger — always rendered for test compatibility */}
        <button
          type="button"
          aria-label="Abrir menu"
          className="md:hidden text-text-secondary hover:text-text-primary"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          aria-label="Menu mobile"
          className="absolute top-full left-0 right-0 border-t border-accent-blue/15 bg-background/95 backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col px-[5%] py-4 gap-4">
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={linkClass}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </nav>
  )
}