import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('PageWrapper', () => {
  it('renders children', () => {
    renderWithRouter(
      <PageWrapper>
        <div>Test Child Content</div>
      </PageWrapper>
    )
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('renders nav element (Navbar)', () => {
    renderWithRouter(
      <PageWrapper>
        <div>Content</div>
      </PageWrapper>
    )
    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
  })

  it('renders footer element', () => {
    renderWithRouter(
      <PageWrapper>
        <div>Content</div>
      </PageWrapper>
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})