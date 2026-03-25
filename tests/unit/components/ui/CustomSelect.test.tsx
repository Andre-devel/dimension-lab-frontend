import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { CustomSelect } from '@/components/ui/CustomSelect'

const options = [
  { value: 'pla', label: 'PLA' },
  { value: 'petg', label: 'PETG' },
  { value: 'abs', label: 'ABS' },
]

describe('CustomSelect', () => {
  it('renders label', () => {
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} options={options} />)
    expect(screen.getByText('Material')).toBeInTheDocument()
  })

  it('shows placeholder when no value selected', () => {
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} options={options} placeholder="Escolha..." />)
    expect(screen.getByText('Escolha...')).toBeInTheDocument()
  })

  it('shows selected option label', () => {
    render(<CustomSelect label="Material" value="petg" onChange={vi.fn()} options={options} />)
    expect(screen.getByText('PETG')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    const user = userEvent.setup()
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} options={options} />)
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    expect(screen.getByText('PLA')).toBeInTheDocument()
    expect(screen.getByText('PETG')).toBeInTheDocument()
    expect(screen.getByText('ABS')).toBeInTheDocument()
  })

  it('calls onChange with selected value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CustomSelect label="Material" value="" onChange={onChange} options={options} />)
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    await user.click(screen.getByRole('button', { name: 'PLA' }))
    expect(onChange).toHaveBeenCalledWith('pla')
  })

  it('closes dropdown after selecting', async () => {
    const user = userEvent.setup()
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} options={options} />)
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    await user.click(screen.getByRole('button', { name: 'ABS' }))
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} options={options} error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
  })

  it('calls onBlur when option is selected', async () => {
    const user = userEvent.setup()
    const onBlur = vi.fn()
    render(<CustomSelect label="Material" value="" onChange={vi.fn()} onBlur={onBlur} options={options} />)
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    await user.click(screen.getByRole('button', { name: 'PLA' }))
    expect(onBlur).toHaveBeenCalled()
  })
})
