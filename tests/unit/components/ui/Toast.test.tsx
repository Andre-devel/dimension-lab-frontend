import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import Toast from '@/components/ui/Toast'
import { useToastStore } from '@/store/toastStore'

function showToast(message: string, type?: 'error' | 'warning' | 'info') {
  act(() => useToastStore.getState().show(message, type))
}

function clearToast() {
  act(() => useToastStore.getState().clear())
}

describe('Toast', () => {
  afterEach(() => clearToast())

  it('renders nothing when no message', () => {
    render(<Toast />)
    expect(screen.queryByRole('button', { name: /fechar/i })).not.toBeInTheDocument()
  })

  it('renders message when store has message', () => {
    render(<Toast />)
    showToast('Ocorreu um erro')
    expect(screen.getByText('Ocorreu um erro')).toBeInTheDocument()
  })

  it('closes when X button is clicked', async () => {
    const user = userEvent.setup()
    render(<Toast />)
    showToast('Mensagem de teste')
    await user.click(screen.getByRole('button', { name: /fechar/i }))
    expect(screen.queryByText('Mensagem de teste')).not.toBeInTheDocument()
  })

  it('auto-dismisses after 6 seconds', () => {
    vi.useFakeTimers()
    render(<Toast />)
    showToast('Auto dismiss')
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(6000))
    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('renders warning type', () => {
    render(<Toast />)
    showToast('Aviso', 'warning')
    expect(screen.getByText('Aviso')).toBeInTheDocument()
  })

  it('renders info type', () => {
    render(<Toast />)
    showToast('Informação', 'info')
    expect(screen.getByText('Informação')).toBeInTheDocument()
  })
})
