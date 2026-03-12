import type { ReactNode } from 'react'

interface Props {
  hoverable?: boolean
  className?: string
  children: ReactNode
}

export function Card({ hoverable = false, className = '', children }: Props) {
  return (
    <div
      className={[
        'rounded-card bg-surface p-4 transition-shadow',
        hoverable ? 'cursor-pointer hover:shadow-glow' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
