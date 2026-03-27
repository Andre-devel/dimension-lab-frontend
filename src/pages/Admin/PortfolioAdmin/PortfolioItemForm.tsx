import { useState, useEffect, useRef } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { PortfolioItemFormData } from '@/services/portfolioService'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import { materialService } from '@/services/catalogService'
import type { Material } from '@/types/catalog'
import { useToastStore } from '@/store/toastStore'

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
  const [materials, setMaterials] = useState<Material[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [standardizingIndexes, setStandardizingIndexes] = useState<Set<number>>(new Set())
  const [modelFile, setModelFile] = useState<File | null>(null)
  const photosInputRef = useRef<HTMLInputElement>(null)
  const modelInputRef = useRef<HTMLInputElement>(null)
  const showToast = useToastStore((s) => s.show)

  useEffect(() => {
    materialService.listAll().then(setMaterials).catch(() => {})
  }, [])

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setCategoryName(initialData.category.name)
      setMaterial(initialData.material)
      setPrintTime(initialData.printTime != null ? String(initialData.printTime) : '')
      setComplexity(initialData.complexity ?? '')
    }
  }, [initialData])

  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f))
    setPhotoPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [photoFiles])

  async function handleStandardize(index: number) {
    const file = photoFiles[index]
    setStandardizingIndexes((prev) => new Set(prev).add(index))
    try {
      const { imageBase64, mimeType } = await portfolioService.standardizeImage(file)
      const binary = atob(imageBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      const ext = mimeType.split('/')[1] ?? 'jpg'
      const standardizedFile = new File([bytes], `standardized-${index}.${ext}`, { type: mimeType })
      setPhotoFiles((prev) => {
        const next = [...prev]
        next[index] = standardizedFile
        return next
      })
    } catch {
      showToast('Falha ao padronizar imagem com IA. Tente novamente.', 'error')
    } finally {
      setStandardizingIndexes((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
  }

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
        <select
          id="material"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          required
          className={fieldClass}
        >
          <option value="">Selecione um material</option>
          {materials.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}{!m.enabled ? ' (inativo)' : ''}
            </option>
          ))}
        </select>
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
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {photoFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group rounded-md overflow-hidden border border-border aspect-square">
                <img
                  src={photoPreviews[index]}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleStandardize(index)}
                  disabled={standardizingIndexes.has(index)}
                  aria-label="Padronizar com IA"
                  className="absolute bottom-1 right-1 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-accent-blue hover:bg-black/90 disabled:opacity-50 transition-colors"
                >
                  {standardizingIndexes.has(index) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  IA
                </button>
              </div>
            ))}
          </div>
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
