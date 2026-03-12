import { render, screen } from '@testing-library/react'
import { Footer } from '@/components/layout/Footer'

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />)
    expect(screen.getByText('DIMENSION.LAB3D')).toBeInTheDocument()
  })

  it('renders copyright text', () => {
    render(<Footer />)
    expect(
      screen.getByText('© 2026 Dimension.Lab3D. Todos os direitos reservados.')
    ).toBeInTheDocument()
  })
})