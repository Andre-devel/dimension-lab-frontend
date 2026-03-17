import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  id?: string
  label: string
  value: string          // YYYY-MM-DD
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function parseDate(str: string): Date | null {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toISO(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplay(str: string): string {
  const d = parseDate(str)
  if (!d) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))

  while (days.length % 7 !== 0) days.push(null)
  return days
}

export function DatePicker({ id, label, value, onChange, onBlur, error }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = parseDate(value)
  const today = new Date()

  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())

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

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(date: Date) {
    onChange(toISO(date))
    setOpen(false)
    onBlur?.()
  }

  const days = buildCalendarDays(viewYear, viewMonth)

  const isSelected = (d: Date) =>
    selected &&
    d.getFullYear() === selected.getFullYear() &&
    d.getMonth() === selected.getMonth() &&
    d.getDate() === selected.getDate()

  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()

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
        onClick={() => setOpen(prev => !prev)}
        className={[
          'flex w-full items-center justify-between rounded-btn border bg-surface px-3 py-2 text-sm outline-none',
          'focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors',
          error ? 'border-red-500' : 'border-border',
          open ? 'border-accent-blue ring-1 ring-accent-blue' : '',
        ].join(' ')}
      >
        <span className={value ? 'text-text-primary' : 'text-text-secondary'}>
          {value ? formatDisplay(value) : 'Selecione a data…'}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-text-secondary" />
      </button>

      {/* Calendar panel */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-btn border border-border bg-surface shadow-lg p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(w => (
              <span key={w} className="text-center text-[10px] font-medium text-text-secondary py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={i} />

              const sel = isSelected(day)
              const tod = isToday(day)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={[
                    'flex h-8 w-full items-center justify-center rounded-md text-xs font-medium transition-colors',
                    sel
                      ? 'bg-accent-blue text-white'
                      : tod
                      ? 'border border-accent-blue/40 text-accent-blue hover:bg-accent-blue/10'
                      : 'text-text-primary hover:bg-surface-2',
                  ].join(' ')}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}