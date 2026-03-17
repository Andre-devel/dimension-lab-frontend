import { useState, useRef, useEffect } from 'react'

interface Option {
  value: string
  label: string
}

interface Props {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: Option[]
  placeholder?: string
  error?: string
}

export function CustomSelect({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Selecione...',
  error,
}: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  function handleSelect(optValue: string) {
    onChange(optValue)
    setOpen(false)
    onBlur?.()
  }

  return (
    <div className="relative flex flex-col gap-1" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="text-sm text-text-secondary">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'flex w-full items-center justify-between rounded-btn border bg-surface px-3 py-2 text-sm outline-none',
          'focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors',
          error ? 'border-red-500' : 'border-border',
          open ? 'border-accent-blue ring-1 ring-accent-blue' : '',
        ].join(' ')}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-secondary'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={[
            'h-4 w-4 text-text-secondary transition-transform duration-150',
            open ? 'rotate-180' : '',
          ].join(' ')}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-btn border border-border bg-surface shadow-lg">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={[
                  'flex w-full items-center px-3 py-2 text-sm transition-colors',
                  opt.value === value
                    ? 'bg-accent-blue/10 text-accent-blue font-medium'
                    : 'text-text-primary hover:bg-surface-2',
                ].join(' ')}
              >
                {opt.value === value && (
                  <svg className="mr-2 h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                )}
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}