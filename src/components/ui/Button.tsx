import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-accent-blue text-white hover:shadow-glow',
  secondary: 'border border-accent-blue text-accent-blue hover:bg-accent-blue/10',
  ghost:     'text-text-secondary hover:text-text-primary',
  danger:    'bg-red-600 text-white hover:bg-red-700',
}

export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...props }: Props) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-all',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
