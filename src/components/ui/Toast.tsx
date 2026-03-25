import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

const TOAST_COLOR: Record<string, string> = {
  error:   'rgb(var(--c-error))',
  warning: 'rgb(var(--c-accent-glow))',
  info:    'rgb(var(--c-accent-blue))',
}

const AUTO_DISMISS_MS = 6000

export default function Toast() {
  const { message, type, clear } = useToastStore()

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(clear, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [message, clear])

  if (!message) return null

  const color = TOAST_COLOR[type]

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-card shadow-lg max-w-md w-[90vw] bg-surface"
      style={{ border: `1px solid ${color}` }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm text-text-primary">{message}</span>
      <button
        onClick={clear}
        aria-label="Fechar notificação"
        className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}