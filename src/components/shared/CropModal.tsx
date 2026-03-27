import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'

interface Props {
  imageSrc: string
  onConfirm: (file: File) => void
  onCancel: () => void
}

export function CropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const file = new File([blob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onConfirm(file)
    } catch {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-surface p-4">
        <p className="text-center text-sm font-medium text-text-primary">
          Ajustar imagem <span className="text-text-secondary">(9:16)</span>
        </p>

        <div className="relative w-full overflow-hidden rounded-md" style={{ height: '60vh' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={9 / 16}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary text-center">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="w-full accent-accent-blue"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-accent-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context unavailable')
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      0.9,
    ),
  )
}