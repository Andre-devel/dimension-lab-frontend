import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Carousel } from '@/components/ui/Carousel'
import type { PortfolioItem } from '@/types/portfolio'

const mockItems: PortfolioItem[] = [
  {
    id: 'item-1',
    title: 'Suporte para câmera',
    category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
    material: 'PLA',
    printTime: 3,
    complexity: 'Médio',
    photos: [],
    visible: true,
  },
  {
    id: 'item-2',
    title: 'Vaso decorativo',
    category: { id: 'cat-2', name: 'Decorativo', slug: 'decorativo' },
    material: 'PETG',
    printTime: 5,
    complexity: 'Fácil',
    photos: ['uploads/vaso.jpg'],
    visible: true,
  },
]

function renderCarousel(items: PortfolioItem[]) {
  return render(
    <MemoryRouter>
      <Carousel items={items} />
    </MemoryRouter>
  )
}

describe('Carousel', () => {
  it('renders nothing when items is empty', () => {
    const { container } = renderCarousel([])
    expect(container.firstChild).toBeNull()
  })

  it('renders item titles', () => {
    renderCarousel(mockItems)
    expect(screen.getByText('Suporte para câmera')).toBeInTheDocument()
    expect(screen.getByText('Vaso decorativo')).toBeInTheDocument()
  })

  it('renders links to portfolio items', () => {
    renderCarousel(mockItems)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/portfolio/item-1')
    expect(links[1]).toHaveAttribute('href', '/portfolio/item-2')
  })

  it('renders category and material tags', () => {
    renderCarousel(mockItems)
    expect(screen.getByText('Mecânico')).toBeInTheDocument()
    expect(screen.getByText('PLA')).toBeInTheDocument()
  })

  it('renders image when item has photos', () => {
    renderCarousel(mockItems)
    const img = screen.getByAltText('Vaso decorativo')
    expect(img).toBeInTheDocument()
  })

  it('renders svg placeholder when item has no photos', () => {
    renderCarousel(mockItems)
    // Item without photos renders an svg placeholder (no img element for it)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1) // only the item with a photo
  })

  it('renders navigation arrow buttons', () => {
    renderCarousel(mockItems)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeInTheDocument()
  })

  it('clicking arrow buttons does not throw', () => {
    renderCarousel(mockItems)
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
  })

  it('mouseEnter and mouseLeave on arrow buttons does not throw', () => {
    renderCarousel(mockItems)
    const next = screen.getByRole('button', { name: 'Próximo' })
    fireEvent.mouseEnter(next)
    fireEvent.mouseLeave(next)
    const prev = screen.getByRole('button', { name: 'Anterior' })
    fireEvent.mouseEnter(prev)
    fireEvent.mouseLeave(prev)
  })
})
