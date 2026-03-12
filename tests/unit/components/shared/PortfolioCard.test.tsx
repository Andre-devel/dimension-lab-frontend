import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PortfolioCard } from '@/components/shared/PortfolioCard'
import type { PortfolioItem } from '@/types/portfolio'

const mockItem: PortfolioItem = {
  id: 'item-1',
  title: 'Suporte para câmera',
  category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
  material: 'PLA',
  printTime: 3,
  complexity: 'Médio',
  photos: ['foto1.jpg'],
  modelFile: undefined,
  visible: true,
}

function renderCard(item = mockItem) {
  return render(
    <MemoryRouter>
      <PortfolioCard item={item} />
    </MemoryRouter>
  )
}

describe('PortfolioCard', () => {
  it('renders item title', () => {
    renderCard()
    expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
  })

  it('renders material', () => {
    renderCard()
    expect(screen.getByText('PLA')).toBeInTheDocument()
  })

  it('renders category name', () => {
    renderCard()
    expect(screen.getByText('Mecânico')).toBeInTheDocument()
  })

  it('renders complexity', () => {
    renderCard()
    expect(screen.getByText('Médio')).toBeInTheDocument()
  })

  it('links to /portfolio/:id', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/portfolio/item-1')
  })

  it('renders printTime when available', () => {
    renderCard()
    expect(screen.getByText(/3h/)).toBeInTheDocument()
  })

  it('does not render printTime when null', () => {
    renderCard({ ...mockItem, printTime: null })
    expect(screen.queryByText(/h$/)).not.toBeInTheDocument()
  })
})