import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
}

export function Input({ label, id, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={[
          'rounded-btn border bg-surface px-3 py-2 text-sm text-text-primary outline-none',
          'placeholder:text-text-secondary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500' : 'border-border',
          className,
        ].join(' ')}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
