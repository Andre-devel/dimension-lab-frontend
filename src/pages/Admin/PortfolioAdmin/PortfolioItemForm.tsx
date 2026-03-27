import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { Sparkles, Loader2, Crop, X } from 'lucide-react'
import type { PortfolioItemFormData } from '@/services/portfolioService'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'
import { materialService } from '@/services/catalogService'
import type { Material } from '@/types/catalog'
import { useToastStore } from '@/store/toastStore'
import { CropModal } from '@/components/shared/CropModal'
import { fileUrl } from '@/utils/fileUrl'

interface Props {
  initialData?: PortfolioItem
  onSubmit: (data: PortfolioItemFormData) => void
  saving?: boolean
}

type PhotoEntry =
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; preview: string }

type CropSession = {
  src: string
  onConfirm: (file: File) => void
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
  const [photos, setPhotos] = useState<PhotoEntry[]>(() =>
    initialData?.photos.map((url) => ({ kind: 'existing' as const, url })) ?? []
  )
  const [standardizingIndexes, setStandardizingIndexes] = useState<Set<number>>(new Set())
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [cropSession, setCropSession] = useState<CropSession | null>(null)
  const cropQueue = useRef<CropSession[]>([])
  const createdPreviews = useRef<string[]>([])
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

  // Revoke all created object URLs on unmount
  useEffect(() => {
    const previews = createdPreviews.current
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const advanceCropQueue = useCallback(() => {
    const next = cropQueue.current.shift()
    setCropSession(next ?? null)
  }, [])

  function openCropSessions(sessions: CropSession[]) {
    if (sessions.length === 0) return
    cropQueue.current = sessions.slice(1)
    setCropSession(sessions[0])
  }

  function makePreview(file: File): string {
    const url = URL.createObjectURL(file)
    createdPreviews.current.push(url)
    return url
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    if (newFiles.length === 0) return
    // Reset input so the same file can be selected again
    e.target.value = ''
    const sessions: CropSession[] = newFiles.map((f) => {
      const src = makePreview(f)
      return {
        src,
        onConfirm: (croppedFile: File) => {
          const preview = makePreview(croppedFile)
          setPhotos((prev) => [...prev, { kind: 'new', file: croppedFile, preview }])
        },
      }
    })
    openCropSessions(sessions)
  }

  async function handleRecrop(index: number) {
    const entry = photos[index]
    let src: string
    let ownsSrc = false

    if (entry.kind === 'existing') {
      const res = await fetch(entry.url)
      const blob = await res.blob()
      src = URL.createObjectURL(blob)
      ownsSrc = true
    } else {
      src = entry.preview
    }

    openCropSessions([{
      src,
      onConfirm: (croppedFile: File) => {
        if (ownsSrc) URL.revokeObjectURL(src)
        const preview = makePreview(croppedFile)
        setPhotos((prev) => {
          const next = [...prev]
          if (prev[index]?.kind === 'new') URL.revokeObjectURL((prev[index] as { preview: string }).preview)
          next[index] = { kind: 'new', file: croppedFile, preview }
          return next
        })
      },
    }])
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => {
      const entry = prev[index]
      if (entry?.kind === 'new') URL.revokeObjectURL(entry.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleCropConfirm(file: File) {
    cropSession?.onConfirm(file)
    advanceCropQueue()
  }

  function handleCropCancel() {
    cropQueue.current = []
    setCropSession(null)
  }

  async function handleStandardize(index: number) {
    const entry = photos[index]
    setStandardizingIndexes((prev) => new Set(prev).add(index))
    try {
      let file: File
      if (entry.kind === 'new') {
        file = entry.file
      } else {
        const res = await fetch(entry.url)
        const blob = await res.blob()
        file = new File([blob], `photo-${index}.jpg`, { type: blob.type || 'image/jpeg' })
      }

      const { imageBase64, mimeType } = await portfolioService.standardizeImage(file)
      const binary = atob(imageBase64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const ext = mimeType.split('/')[1] ?? 'jpg'
      const standardizedFile = new File([bytes], `standardized-${index}.${ext}`, { type: mimeType })
      const src = makePreview(standardizedFile)

      openCropSessions([{
        src,
        onConfirm: (croppedFile: File) => {
          URL.revokeObjectURL(src)
          const preview = makePreview(croppedFile)
          setPhotos((prev) => {
            const next = [...prev]
            if (prev[index]?.kind === 'new') URL.revokeObjectURL((prev[index] as { preview: string }).preview)
            next[index] = { kind: 'new', file: croppedFile, preview }
            return next
          })
        },
      }])
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? 'Falha ao padronizar imagem com IA. Tente novamente.')
        : 'Falha ao padronizar imagem com IA. Tente novamente.'
      showToast(message, 'error')
    } finally {
      setStandardizingIndexes((prev) => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !categoryName.trim() || !material.trim()) return

    const hasNewPhotos = photos.some((p) => p.kind === 'new')
    let photoFiles: File[] | undefined

    if (hasNewPhotos) {
      photoFiles = await Promise.all(
        photos.map(async (entry, i) => {
          if (entry.kind === 'new') return entry.file
          const res = await fetch(entry.url)
          const blob = await res.blob()
          return new File([blob], `existing-${i}.jpg`, { type: blob.type || 'image/jpeg' })
        })
      )
    }

    onSubmit({
      title: title.trim(),
      categoryName: categoryName.trim(),
      material: material.trim(),
      printTime: printTime ? Number(printTime) : null,
      complexity: complexity.trim() || undefined,
      photos: photoFiles,
      modelFile: modelFile ?? null,
    })
  }

  const fieldClass =
    'w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-accent-blue focus:outline-none'
  const labelClass = 'block text-xs font-medium uppercase text-text-secondary mb-1'

  return (
    <>
      {cropSession && (
        <CropModal
          imageSrc={cropSession.src}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

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
          <label className={labelClass}>Fotos</label>

          {photos.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((entry, index) => {
                const src = entry.kind === 'existing'
                  ? fileUrl(entry.url)
                  : entry.preview
                return (
                  <div
                    key={index}
                    className="relative group rounded-md overflow-hidden border border-border aspect-[9/16]"
                  >
                    <img
                      src={src}
                      alt={`foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      aria-label="Remover foto"
                      className="absolute top-1 right-1 flex items-center justify-center rounded-full bg-black/70 p-1 text-white hover:bg-black/90 transition-colors"
                    >
                      <X size={12} />
                    </button>

                    {/* Bottom action buttons */}
                    <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleRecrop(index)}
                        disabled={standardizingIndexes.has(index)}
                        aria-label="Recortar foto"
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white hover:bg-black/90 disabled:opacity-50 transition-colors"
                      >
                        <Crop size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStandardize(index)}
                        disabled={standardizingIndexes.has(index)}
                        aria-label="Padronizar com IA"
                        className="flex flex-1 items-center justify-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-accent-blue hover:bg-black/90 disabled:opacity-50 transition-colors"
                      >
                        {standardizingIndexes.has(index) ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Sparkles size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-text-primary hover:file:bg-border cursor-pointer"
          />
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
    </>
  )
}
