import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { UploadCloud } from 'lucide-react'

interface Props {
  onFilesChange: (files: File[]) => void
  accept?: string
  error?: string
}

export function FileUploadZone({ onFilesChange, accept, error }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: File[]) {
    const updated = [...files, ...newFiles]
    setFiles(updated)
    onFilesChange(updated)
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange(updated)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) {
      addFiles(dropped)
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) {
      addFiles(selected)
    }
  }

  function handleClick() {
    inputRef.current?.click()
  }

  const borderClass = error
    ? 'border-red-500'
    : isDragging
    ? 'border-accent-blue bg-accent-blue/5'
    : 'border-border'

  return (
    <div>
      <div
        role="button"
        aria-label="Upload de arquivos"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'flex cursor-pointer flex-row items-center gap-4 rounded-card border-2 border-dashed transition-colors',
          borderClass,
        ].join(' ')}
        style={{ padding: '14px 20px' }}
      >
        <UploadCloud className="h-6 w-6 text-text-secondary flex-shrink-0" />
        <div>
          <p className="text-sm text-text-secondary">
            Clique para enviar ou arraste arquivos aqui
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--c-text-muted))' }}>STL, OBJ, JPG, PNG, MP4</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-btn bg-surface-2 px-3 py-2 text-sm text-text-primary"
            >
              <span>{file.name}</span>
              <button
                type="button"
                aria-label={`Remover ${file.name}`}
                onClick={() => removeFile(index)}
                className="ml-2 text-text-secondary hover:text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}