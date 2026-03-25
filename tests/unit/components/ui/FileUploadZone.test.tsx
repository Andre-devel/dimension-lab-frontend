import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { FileUploadZone } from '@/components/ui/FileUploadZone'

describe('FileUploadZone', () => {
  const mockOnFilesChange = vi.fn()

  beforeEach(() => {
    mockOnFilesChange.mockClear()
  })

  it('renders upload zone with correct text', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    expect(screen.getByText('Clique para enviar ou arraste arquivos aqui')).toBeInTheDocument()
  })

  it('has role button and correct aria-label', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    expect(screen.getByRole('button', { name: 'Upload de arquivos' })).toBeInTheDocument()
  })

  it('shows dragging state on dragover', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    fireEvent.dragOver(zone)
    expect(zone.className).toMatch(/border-accent-blue/)
  })

  it('shows idle state on dragleave', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    fireEvent.dragOver(zone)
    fireEvent.dragLeave(zone)
    expect(zone.className).toMatch(/border-border/)
  })

  it('calls onFilesChange when files are dropped', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    const file = new File(['content'], 'model.stl', { type: 'application/octet-stream' })
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file],
      },
    })
    expect(mockOnFilesChange).toHaveBeenCalledWith([file])
  })

  it('calls onFilesChange when files selected via input', async () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    await userEvent.upload(input, file)
    expect(mockOnFilesChange).toHaveBeenCalledWith([file])
  })

  it('shows selected file names', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    const file = new File(['content'], 'mymodel.obj', { type: 'application/octet-stream' })
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file],
      },
    })
    expect(screen.getByText('mymodel.obj')).toBeInTheDocument()
  })

  it('removes file when clicking remove button', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    const file = new File(['content'], 'remove-me.stl', { type: 'application/octet-stream' })
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file],
      },
    })
    expect(screen.getByText('remove-me.stl')).toBeInTheDocument()
    const removeButton = screen.getByRole('button', { name: /remover/i })
    fireEvent.click(removeButton)
    expect(screen.queryByText('remove-me.stl')).not.toBeInTheDocument()
  })

  it('shows error state and message when error prop provided', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} error="Arquivo inválido" />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    expect(zone.className).toMatch(/border-red-500/)
    expect(screen.getByText('Arquivo inválido')).toBeInTheDocument()
  })

  it('calls onFilesChange after removing a file', () => {
    render(<FileUploadZone onFilesChange={mockOnFilesChange} />)
    const zone = screen.getByRole('button', { name: 'Upload de arquivos' })
    const file1 = new File(['content'], 'file1.stl', { type: 'application/octet-stream' })
    const file2 = new File(['content'], 'file2.stl', { type: 'application/octet-stream' })
    fireEvent.drop(zone, {
      dataTransfer: {
        files: [file1, file2],
      },
    })
    mockOnFilesChange.mockClear()
    const removeButtons = screen.getAllByRole('button', { name: /remover/i })
    fireEvent.click(removeButtons[0])
    expect(mockOnFilesChange).toHaveBeenCalledWith([file2])
  })
})