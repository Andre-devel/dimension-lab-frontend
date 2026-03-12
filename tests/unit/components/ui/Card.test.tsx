import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from '@/components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies hoverable class when hoverable prop is set', () => {
    const { container } = render(<Card hoverable>Hover me</Card>)
    expect(container.firstChild).toHaveClass('hover:shadow-glow')
  })

  it('does not apply hover effect by default', () => {
    const { container } = render(<Card>Static</Card>)
    expect(container.firstChild).not.toHaveClass('hover:shadow-glow')
  })
})
