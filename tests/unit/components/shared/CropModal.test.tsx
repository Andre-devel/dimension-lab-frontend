import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CropModal } from '@/components/shared/CropModal'

vi.mock('react-easy-crop', () => ({
  default: ({ onCropComplete }: { onCropComplete: (area: unknown, pixels: unknown) => void }) => {
    // Call outside render to avoid setState-during-render
    setTimeout(() => onCropComplete({}, { x: 0, y: 0, width: 900, height: 1600 }), 0)
    return <div data-testid="cropper" />
  },
}))

describe('CropModal', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toBlob = function (cb) {
      cb(new Blob(['img'], { type: 'image/jpeg' }))
    }
    global.Image = class {
      onload: (() => void) | null = null
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0)
      }
    } as unknown as typeof Image
  })

  it('renders crop area and action buttons', () => {
    render(<CropModal imageSrc="blob:mock" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    expect(screen.getByTestId('cropper')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('renders zoom slider', () => {
    render(<CropModal imageSrc="blob:mock" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    expect(screen.getByRole('slider', { name: /zoom/i })).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<CropModal imageSrc="blob:mock" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockOnCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm with a File when confirm button is clicked', async () => {
    render(<CropModal imageSrc="blob:mock" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    // Wait for the setTimeout in the mock to fire onCropComplete
    await new Promise((r) => setTimeout(r, 20))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith(expect.any(File))
    })
  })

  it('updates zoom when slider changes', () => {
    render(<CropModal imageSrc="blob:mock" onConfirm={mockOnConfirm} onCancel={mockOnCancel} />)
    const slider = screen.getByRole('slider', { name: /zoom/i })
    fireEvent.change(slider, { target: { value: '2' } })
    expect(slider).toHaveValue('2')
  })
})