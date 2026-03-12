import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/ui/Badge'

describe('StatusBadge', () => {
  it('renders the correct label for RECEIVED', () => {
    render(<StatusBadge status="RECEIVED" />)
    expect(screen.getByText('Recebido')).toBeInTheDocument()
  })

  it('renders the correct label for DELIVERED', () => {
    render(<StatusBadge status="DELIVERED" />)
    expect(screen.getByText('Entregue')).toBeInTheDocument()
  })

  it('renders the correct label for all statuses', () => {
    const statuses = ['RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'PRINTING', 'READY', 'DELIVERED'] as const
    const { rerender } = render(<StatusBadge status="RECEIVED" />)
    statuses.forEach((status) => {
      rerender(<StatusBadge status={status} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })
})
