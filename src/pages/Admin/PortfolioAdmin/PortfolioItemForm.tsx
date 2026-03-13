import { useState, useEffect, useRef } from 'react'
import type { PortfolioItemFormData } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

interface Props {
  initialData?: PortfolioItem
  onSubmit: (data: PortfolioItemFormData) => void
  saving?: boolean
}

export default function PortfolioItemForm({ initialData, onSubmit, saving }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [categoryName, setCategoryName] = useState(initialData?.category.name ?? '')
  const [material, setMaterial] = useState(initialData?.material ?? '')
  const [printTime, setPrintTime] = useState<string>(
    initialData?.printTime != null ? String(initialData.printTime) : ''
  )
  const [complexity, setComplexity] = useState(initialData?.complexity ?? '')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [modelFile, setModelFile] = useState<File | null>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setCategoryName(initialData.category.name)
      setMaterial(initialData.material)
      setPrintTime(initialData.printTime != null ? String(initialData.printTime) : '')
      setComplexity(initialData.complexity ?? '')
    }
  }, [initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !categoryName.trim() || !material.trim()) return

    onSubmit({
      title: title.trim(),
      categoryName: categoryName.trim(),
      material: material.trim(),
      printTime: printTime ? Number(printTime) : null,
      complexity: complexity.trim() || undefined,
      photos: photoFiles.length > 0 ? photoFiles : undefined,
      modelFile: modelFile ?? null,
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
        <label className={labelClass}>
          Fotos
          {initialData && initialData.photos.length > 0 && (
            <span className="ml-2 text-text-secondary normal-case font-normal">
              ({initialData.photos.length} atual(is) — novas substituem)
            </span>
          )}
        </label>
        <input
          ref={photosInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotoFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border cursor-pointer"
        />
        {photoFiles.length > 0 && (
          <p className="mt-1 text-xs text-text-secondary">
            {photoFiles.length} foto(s) selecionada(s)
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          Arquivo 3D (STL / GLB / OBJ)
          {initialData?.modelFile && (
            <span className="ml-2 text-text-secondary normal-case font-normal">
              (já possui — novo substitui)
            </span>
          )}
        </label>
        <input
          ref={modelInputRef}
          type="file"
          accept=".stl,.glb,.obj,.3mf"
          onChange={(e) => setModelFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border cursor-pointer"
        />
        {modelFile && (
          <p className="mt-1 text-xs text-text-secondary">{modelFile.name}</p>
        )}
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