import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/services/catalogService', () => ({
  materialService: {
    listAll: vi.fn(),
    listActive: vi.fn(),
  },
  colorService: {
    listAll: vi.fn(),
    listActive: vi.fn(),
  },
}))

vi.mock('@/services/portfolioService', () => ({
  portfolioService: {
    standardizeImage: vi.fn(),
  },
}))

vi.mock('@/store/toastStore', () => ({
  useToastStore: vi.fn(),
}))

vi.mock('@/utils/fileUrl', () => ({
  fileUrl: (path: string) => `http://localhost:8080${path}`,
}))

vi.mock('@/components/shared/CropModal', () => ({
  CropModal: ({ onConfirm, onCancel }: { onConfirm: (f: File) => void; onCancel: () => void }) => (
    <div data-testid="crop-modal">
      <button onClick={() => onConfirm(new File(['cropped'], 'crop.jpg', { type: 'image/jpeg' }))}>
        Confirmar
      </button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}))

import { materialService } from '@/services/catalogService'
import { portfolioService } from '@/services/portfolioService'
import { useToastStore } from '@/store/toastStore'
import PortfolioItemForm from '@/pages/Admin/PortfolioAdmin/PortfolioItemForm'

const mockOnSubmit = vi.fn()
const mockShowToast = vi.fn()

const MATERIALS = [
  { id: 'm1', name: 'PLA', enabled: true },
  { id: 'm2', name: 'PETG', enabled: true },
]

const INITIAL_DATA_WITH_PHOTOS = {
  id: 'item-1',
  title: 'Vaso',
  category: { id: 'cat-1', name: 'Decorativo', slug: 'decorativo' },
  material: 'PLA',
  printTime: null,
  complexity: undefined,
  photos: ['/uploads/portfolio/photo1.jpg', '/uploads/portfolio/photo2.jpg'],
  visible: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(materialService.listAll).mockResolvedValue(MATERIALS)
  vi.mocked(useToastStore).mockReturnValue(mockShowToast)
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
  global.fetch = vi.fn().mockResolvedValue({
    blob: () => Promise.resolve(new Blob(['img'], { type: 'image/jpeg' })),
  }) as unknown as typeof fetch
})

function renderForm(initialData?: Parameters<typeof PortfolioItemForm>[0]['initialData']) {
  return render(
    <MemoryRouter>
      <PortfolioItemForm onSubmit={mockOnSubmit} initialData={initialData} />
    </MemoryRouter>
  )
}

function selectNewPhotos(files: File[]) {
  const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
  fireEvent.change(input, { target: { files } })
}

async function selectAndConfirmCrop(files: File[]) {
  selectNewPhotos(files)
  for (let i = 0; i < files.length; i++) {
    await waitFor(() => screen.getByTestId('crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
  }
  await waitFor(() => expect(screen.queryByTestId('crop-modal')).not.toBeInTheDocument())
}

describe('PortfolioItemForm', () => {
  it('renders required fields', () => {
    renderForm()
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/material/i)).toBeInTheDocument()
  })

  it('renders file inputs for photos and model', () => {
    renderForm()
    const fileInputs = document.querySelectorAll('input[type="file"]')
    expect(fileInputs.length).toBe(2)
  })

  it('calls onSubmit with form data when submitted', async () => {
    renderForm()
    await waitFor(() => screen.getByRole('option', { name: 'PLA' }))

    fireEvent.change(screen.getByLabelText(/título/i), { target: { value: 'Vaso' } })
    fireEvent.change(screen.getByLabelText(/categoria/i), { target: { value: 'Decorativo' } })
    fireEvent.change(screen.getByLabelText(/material/i), { target: { value: 'PLA' } })

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Vaso', categoryName: 'Decorativo', material: 'PLA' })
      )
    })
  })

  it('does not submit when required fields are empty', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills form when initialData is provided', async () => {
    renderForm(INITIAL_DATA_WITH_PHOTOS)
    expect(screen.getByDisplayValue('Vaso')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByDisplayValue('PLA')).toBeInTheDocument())
  })

  describe('existing photos (edit mode)', () => {
    it('shows existing photo thumbnails when editing', () => {
      renderForm(INITIAL_DATA_WITH_PHOTOS)
      const imgs = screen.getAllByRole('img')
      expect(imgs.length).toBeGreaterThanOrEqual(2)
    })

    it('shows recrop button for each existing photo', () => {
      renderForm(INITIAL_DATA_WITH_PHOTOS)
      expect(screen.getAllByRole('button', { name: /recortar/i })).toHaveLength(2)
    })

    it('opens crop modal when recrop is clicked on existing photo', async () => {
      renderForm(INITIAL_DATA_WITH_PHOTOS)
      fireEvent.click(screen.getAllByRole('button', { name: /recortar/i })[0])
      await waitFor(() => expect(screen.getByTestId('crop-modal')).toBeInTheDocument())
    })

    it('replaces existing photo after confirming recrop', async () => {
      renderForm(INITIAL_DATA_WITH_PHOTOS)
      fireEvent.click(screen.getAllByRole('button', { name: /recortar/i })[0])
      await waitFor(() => screen.getByTestId('crop-modal'))
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
      await waitFor(() => expect(screen.queryByTestId('crop-modal')).not.toBeInTheDocument())
      // Still 2 photos
      expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2)
    })

    it('removes photo when remove button is clicked', async () => {
      renderForm(INITIAL_DATA_WITH_PHOTOS)
      const removeButtons = screen.getAllByRole('button', { name: /remover/i })
      expect(removeButtons).toHaveLength(2)
      fireEvent.click(removeButtons[0])
      await waitFor(() => {
        expect(screen.getAllByRole('img').length).toBeLessThan(
          INITIAL_DATA_WITH_PHOTOS.photos.length
        )
      })
    })
  })

  describe('crop flow (new photos)', () => {
    it('opens crop modal when photo is selected', async () => {
      renderForm()
      selectNewPhotos([new File(['img'], 'photo.jpg', { type: 'image/jpeg' })])
      await waitFor(() => expect(screen.getByTestId('crop-modal')).toBeInTheDocument())
    })

    it('adds photo after confirming crop', async () => {
      renderForm()
      await selectAndConfirmCrop([new File(['img'], 'photo.jpg', { type: 'image/jpeg' })])
      expect(screen.getAllByRole('button', { name: /padronizar com ia/i })).toHaveLength(1)
    })

    it('dismisses crop modal on cancel without adding photo', async () => {
      renderForm()
      selectNewPhotos([new File(['img'], 'photo.jpg', { type: 'image/jpeg' })])
      await waitFor(() => screen.getByTestId('crop-modal'))
      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
      await waitFor(() => expect(screen.queryByTestId('crop-modal')).not.toBeInTheDocument())
      expect(screen.queryByRole('button', { name: /padronizar com ia/i })).not.toBeInTheDocument()
    })

    it('queues crop for multiple selected photos', async () => {
      renderForm()
      const files = [
        new File(['img1'], 'p1.jpg', { type: 'image/jpeg' }),
        new File(['img2'], 'p2.jpg', { type: 'image/jpeg' }),
      ]
      await selectAndConfirmCrop(files)
      expect(screen.getAllByRole('button', { name: /padronizar com ia/i })).toHaveLength(2)
    })
  })

  describe('AI standardization', () => {
    it('disables AI button while standardizing and re-enables after', async () => {
      let resolveStandardize!: (v: { imageBase64: string; mimeType: string }) => void
      vi.mocked(portfolioService.standardizeImage).mockImplementation(
        () => new Promise((res) => { resolveStandardize = res })
      )

      renderForm()
      await selectAndConfirmCrop([new File(['img'], 'photo.jpg', { type: 'image/jpeg' })])

      await waitFor(() => screen.getByRole('button', { name: /padronizar com ia/i }))
      fireEvent.click(screen.getByRole('button', { name: /padronizar com ia/i }))

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /padronizar com ia/i })).toBeDisabled()
      )

      const base64 = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0))
      resolveStandardize({ imageBase64: base64, mimeType: 'image/jpeg' })

      await waitFor(() => screen.getByTestId('crop-modal'))
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /padronizar com ia/i })).not.toBeDisabled()
      )
    })

    it('calls portfolioService.standardizeImage with the photo file', async () => {
      const base64 = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0))
      vi.mocked(portfolioService.standardizeImage).mockResolvedValue({
        imageBase64: base64,
        mimeType: 'image/jpeg',
      })

      renderForm()
      await selectAndConfirmCrop([new File(['img'], 'photo.jpg', { type: 'image/jpeg' })])

      fireEvent.click(screen.getByRole('button', { name: /padronizar com ia/i }))

      await waitFor(() =>
        expect(vi.mocked(portfolioService.standardizeImage)).toHaveBeenCalled()
      )

      await waitFor(() => screen.getByTestId('crop-modal'))
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    })
  })
})
