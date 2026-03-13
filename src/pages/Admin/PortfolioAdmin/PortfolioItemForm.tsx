import { useState, useEffect } from 'react'
import type { PortfolioItemFormData } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

interface Props {
  initialData?: PortfolioItem
  onSubmit: (data: PortfolioItemFormData) => void
  saving?: boolean
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function PortfolioItemForm({ initialData, onSubmit, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [categoryName, setCategoryName] = useState(initialData?.category.name ?? '')
  const [material, setMaterial] = useState(initialData?.material ?? '')
  const [printTime, setPrintTime] = useState<string>(
    initialData?.printTime != null ? String(initialData.printTime) : ''
  )
  const [complexity, setComplexity] = useState(initialData?.complexity ?? '')
  const [photosText, setPhotosText] = useState(initialData?.photos.join('\n') ?? '')
  const [modelFile, setModelFile] = useState(initialData?.modelFile ?? '')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setCategoryName(initialData.category.name)
      setMaterial(initialData.material)
      setPrintTime(initialData.printTime != null ? String(initialData.printTime) : '')
      setComplexity(initialData.complexity ?? '')
      setPhotosText(initialData.photos.join('\n'))
      setModelFile(initialData.modelFile ?? '')
    }
  }, [initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !categoryName.trim() || !material.trim()) return

    const photos = photosText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    onSubmit({
      title: title.trim(),
      category: {
        id: initialData?.category.id,
        name: categoryName.trim(),
        slug: slugify(categoryName.trim()),
      },
      material: material.trim(),
      printTime: printTime ? Number(printTime) : null,
      complexity: complexity.trim() || undefined,
      photos,
      modelFile: modelFile.trim() || undefined,
    })
  }

  const fieldClass =
    'w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none'
  const labelClass = 'block text-xs font-medium uppercase text-text-secondary mb-1'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className={labelClass}>Título *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={fieldClass}
          placeholder="Ex: Suporte para câmera"
        />
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>Categoria *</label>
        <input
          id="category"
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          className={fieldClass}
          placeholder="Ex: Mecânico"
        />
      </div>

      <div>
        <label htmlFor="material" className={labelClass}>Material *</label>
        <input
          id="material"
          type="text"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          required
          className={fieldClass}
          placeholder="Ex: PLA"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="printTime" className={labelClass}>Tempo de impressão (h)</label>
          <input
            id="printTime"
            type="number"
            min={0}
            value={printTime}
            onChange={(e) => setPrintTime(e.target.value)}
            className={fieldClass}
            placeholder="Ex: 3"
          />
        </div>
        <div>
          <label htmlFor="complexity" className={labelClass}>Complexidade</label>
          <input
            id="complexity"
            type="text"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className={fieldClass}
            placeholder="Ex: Médio"
          />
        </div>
      </div>

      <div>
        <label htmlFor="photos" className={labelClass}>URLs das fotos (uma por linha)</label>
        <textarea
          id="photos"
          value={photosText}
          onChange={(e) => setPhotosText(e.target.value)}
          rows={3}
          className={fieldClass}
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="modelFile" className={labelClass}>URL do arquivo 3D (STL/GLB)</label>
        <input
          id="modelFile"
          type="text"
          value={modelFile}
          onChange={(e) => setModelFile(e.target.value)}
          className={fieldClass}
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded-md bg-accent-blue px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}