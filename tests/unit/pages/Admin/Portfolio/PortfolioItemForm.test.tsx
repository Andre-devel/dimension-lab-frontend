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

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(materialService.listAll).mockResolvedValue(MATERIALS)
  vi.mocked(useToastStore).mockReturnValue(mockShowToast)
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()
})

function renderForm(initialData?: Parameters<typeof PortfolioItemForm>[0]['initialData']) {
  return render(
    <MemoryRouter>
      <PortfolioItemForm onSubmit={mockOnSubmit} initialData={initialData} />
    </MemoryRouter>
  )
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
        expect.objectContaining({
          title: 'Vaso',
          categoryName: 'Decorativo',
          material: 'PLA',
        })
      )
    })
  })

  it('does not submit when required fields are empty', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('pre-fills form when initialData is provided', async () => {
    renderForm({
      id: 'item-1',
      title: 'Vaso Decorativo',
      category: { id: 'cat-1', name: 'Decorativo', slug: 'decorativo' },
      material: 'PLA',
      printTime: 2,
      complexity: 'Fácil',
      photos: ['foto.jpg'],
      visible: true,
    })
    expect(screen.getByDisplayValue('Vaso Decorativo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Decorativo')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByDisplayValue('PLA')).toBeInTheDocument()
    })
  })

  describe('AI standardization', () => {
    function selectPhotos(files: File[]) {
      const input = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement
      fireEvent.change(input, { target: { files } })
    }

    it('shows AI button for each selected photo', async () => {
      renderForm()
      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      selectPhotos([file])

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /padronizar com ia/i })).toHaveLength(1)
      })
    })

    it('shows AI button for each photo when multiple selected', async () => {
      renderForm()
      const files = [
        new File(['img1'], 'photo1.jpg', { type: 'image/jpeg' }),
        new File(['img2'], 'photo2.jpg', { type: 'image/jpeg' }),
      ]
      selectPhotos(files)

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /padronizar com ia/i })).toHaveLength(2)
      })
    })

    it('disables AI button while standardizing and re-enables after', async () => {
      let resolveStandardize!: (v: { imageBase64: string; mimeType: string }) => void
      vi.mocked(portfolioService.standardizeImage).mockImplementation(
        () => new Promise((res) => { resolveStandardize = res })
      )

      renderForm()
      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      selectPhotos([file])

      await waitFor(() => screen.getByRole('button', { name: /padronizar com ia/i }))
      fireEvent.click(screen.getByRole('button', { name: /padronizar com ia/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /padronizar com ia/i })).toBeDisabled()
      })

      const base64 = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0))
      resolveStandardize({ imageBase64: base64, mimeType: 'image/jpeg' })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /padronizar com ia/i })).not.toBeDisabled()
      })
    })

    it('calls portfolioService.standardizeImage with the correct file', async () => {
      const base64 = btoa(String.fromCharCode(0xff, 0xd8, 0xff, 0xe0))
      vi.mocked(portfolioService.standardizeImage).mockResolvedValue({
        imageBase64: base64,
        mimeType: 'image/jpeg',
      })

      renderForm()
      const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
      selectPhotos([file])

      await waitFor(() => screen.getByRole('button', { name: /padronizar com ia/i }))
      fireEvent.click(screen.getByRole('button', { name: /padronizar com ia/i }))

      await waitFor(() => {
        expect(vi.mocked(portfolioService.standardizeImage)).toHaveBeenCalledWith(file)
      })
    })
  })
})
