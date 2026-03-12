import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with a label', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message when error prop is provided', () => {
    render(<Input label="Email" id="email" error="Campo obrigatório" />)
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input label="Name" id="name" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('calls onChange when user types', async () => {
    const onChange = vi.fn()
    render(<Input label="Name" id="name" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'abc')
    expect(onChange).toHaveBeenCalled()
  })
})
