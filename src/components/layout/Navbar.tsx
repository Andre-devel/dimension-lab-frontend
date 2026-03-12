import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Portfólio', to: '/portfolio' },
  { label: 'Orçamento', to: '/quote' },
]

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? 'text-accent-blue font-medium' : 'text-text-secondary hover:text-text-primary'
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-surface"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <NavLink to="/" className="flex items-baseline gap-0.5">
          <span className="font-heading font-bold text-text-primary">DIMENSION</span>
          <span className="font-heading text-accent-blue">.LAB3D</span>
        </NavLink>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass} end={to === '/'}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
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
        <nav aria-label="Menu mobile" className="border-t border-border bg-surface md:hidden">
          <ul className="flex flex-col px-4 py-3 gap-3">
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