export interface Category {
  id: string
  name: string
  slug: string
}

export interface PortfolioItem {
  id: string
  title: string
  category: Category
  material: string
  printTime: string
  complexity: string
  photos: string[]
  modelFile?: string
  visible: boolean
}
