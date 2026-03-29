import { render, screen, waitFor, act, fireEvent, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    list: vi.fn(),
    listCategories: vi.fn(),
  },
}))
vi.mock('@/components/layout/PageWrapper', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/seo/SEOHead', () => ({
  SEOHead: () => null,
  SITE_URL: 'https://dimensionlab.tech',
}))
vi.mock('@/components/ui/Reveal', () => ({
  Reveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/shared/PortfolioCard', () => ({
  PortfolioCard: ({ item }: { item: { title: string } }) => (
    <div data-testid="portfolio-card">{item.title}</div>
  ),
}))

import Portfolio from '@/pages/Portfolio'
import { portfolioService } from '@/services/portfolioService'
import type { PagedResponse, CategorySummary } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

function makeItem(i: number, categoryName = 'Decorativo'): PortfolioItem {
  return {
    id: `item-${i}`,
    title: `Item ${i}`,
    category: { id: `cat-${categoryName}`, name: categoryName, slug: categoryName.toLowerCase() },
    material: 'PLA',
    printTime: null,
    complexity: 'Fácil',
    photos: [],
    visible: true,
  }
}

function makePage(
  items: PortfolioItem[],
  totalElements: number,
  hasNext: boolean,
  page = 0,
): PagedResponse<PortfolioItem> {
  return {
    content: items,
    page,
    size: 9,
    totalElements,
    totalPages: Math.ceil(totalElements / 9),
    hasNext,
  }
}

let observerCallback: IntersectionObserverCallback | null = null

beforeEach(() => {
  observerCallback = null
  window.IntersectionObserver = vi.fn((cb: IntersectionObserverCallback) => {
    observerCallback = cb
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
  }) as unknown as typeof IntersectionObserver
  // default: no server categories
  vi.mocked(portfolioService.listCategories).mockResolvedValue([])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('Portfolio — infinite scroll com paginação real', () => {
  it('renderiza a primeira página de itens', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 18, true),
    )
    render(<Portfolio />)
    await waitFor(() => expect(screen.getAllByTestId('portfolio-card')).toHaveLength(9))
  })

  it('carrega a próxima página quando o sentinel é intersectado', async () => {
    const page0 = makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 15, true, 0)
    const page1 = makePage(Array.from({ length: 6 }, (_, i) => makeItem(9 + i)), 15, false, 1)
    vi.mocked(portfolioService.list)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1)

    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() => expect(screen.getAllByTestId('portfolio-card')).toHaveLength(15))
  })

  it('chama list com page=0 e page=1 ao scrollar', async () => {
    const page0 = makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 12, true, 0)
    const page1 = makePage(Array.from({ length: 3 }, (_, i) => makeItem(9 + i)), 12, false, 1)
    vi.mocked(portfolioService.list)
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1)

    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    await waitFor(() => {
      expect(portfolioService.list).toHaveBeenCalledWith(0, 9, undefined)
      expect(portfolioService.list).toHaveBeenCalledWith(1, 9, undefined)
    })
  })

  it('não faz nova requisição quando sentinel não está intersectando', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 18, true),
    )
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    act(() => {
      observerCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(portfolioService.list).toHaveBeenCalledTimes(1)
  })

  it('não faz nova requisição quando hasNext é false', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 5 }, (_, i) => makeItem(i)), 5, false),
    )
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })

    expect(portfolioService.list).toHaveBeenCalledTimes(1)
  })

  it('exibe spinner quando há mais itens a carregar', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 18, true),
    )
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('não exibe spinner quando todos os itens já foram carregados', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 5 }, (_, i) => makeItem(i)), 5, false),
    )
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('exibe o total de projetos do servidor no hero', async () => {
    vi.mocked(portfolioService.list).mockResolvedValue(
      makePage(Array.from({ length: 9 }, (_, i) => makeItem(i)), 42, true),
    )
    render(<Portfolio />)
    // '42' aparece no hero (stat) e no badge do filtro — usa getAllByText
    await waitFor(() => expect(screen.getAllByText('42').length).toBeGreaterThan(0))
  })
})

describe('Portfolio — filtro de categorias com overflow', () => {
  const CATS = ['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat E', 'Cat F', 'Cat G']

  function serverCats(cats: string[]): CategorySummary[] {
    return cats.map(name => ({ name, count: 2 }))
  }

  function pageWithCategories(cats: string[]) {
    const items = cats.map((cat, i) => makeItem(i, cat))
    return makePage(items, items.length, false)
  }

  function desktop() {
    return screen.getByTestId('category-bar-desktop')
  }

  function mobile() {
    return screen.getByTestId('category-bar-mobile')
  }

  it('não exibe botão Mais no desktop quando há até 4 categorias do servidor', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS.slice(0, 4)))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS.slice(0, 4)))
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    expect(within(desktop()).queryByRole('button', { name: /mais/i })).not.toBeInTheDocument()
  })

  it('exibe botão Mais no desktop quando há mais de 4 categorias do servidor', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS))
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    expect(within(desktop()).getByRole('button', { name: /mais/i })).toBeInTheDocument()
  })

  it('oculta categorias excedentes no desktop antes de abrir o dropdown', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS))
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    expect(within(desktop()).queryByRole('button', { name: /cat f/i })).not.toBeInTheDocument()
    expect(within(desktop()).queryByRole('button', { name: /cat g/i })).not.toBeInTheDocument()
  })

  it('abre dropdown com categorias ocultas ao clicar em Mais', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS))
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    fireEvent.click(within(desktop()).getByRole('button', { name: /mais/i }))

    expect(within(desktop()).getByRole('button', { name: /cat f/i })).toBeInTheDocument()
    expect(within(desktop()).getByRole('button', { name: /cat g/i })).toBeInTheDocument()
  })

  it('selecionar categoria do dropdown fecha o dropdown', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS))
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))

    fireEvent.click(within(desktop()).getByRole('button', { name: /mais/i }))
    fireEvent.click(within(desktop()).getByRole('button', { name: /cat f/i }))

    await waitFor(() =>
      expect(within(desktop()).queryByRole('button', { name: /cat g/i })).not.toBeInTheDocument(),
    )
  })

  it('exibe todas as categorias do servidor no mobile desde o início', async () => {
    vi.mocked(portfolioService.listCategories).mockResolvedValue(serverCats(CATS))
    vi.mocked(portfolioService.list).mockResolvedValue(pageWithCategories(CATS.slice(0, 3))) // só 3 itens carregados
    render(<Portfolio />)
    await waitFor(() => screen.getAllByTestId('portfolio-card'))
    // todas as 7 categorias devem aparecer no mobile mesmo com só 3 itens carregados
    CATS.forEach(cat => {
      expect(within(mobile()).getByRole('button', { name: new RegExp(cat, 'i') })).toBeInTheDocument()
    })
    expect(within(mobile()).getByRole('button', { name: /todos/i })).toBeInTheDocument()
  })
})