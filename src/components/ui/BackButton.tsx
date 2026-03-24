import { Link, useNavigate } from 'react-router-dom'

interface BackButtonProps {
  /** Rota fixa de destino. Se omitido usa navigate(-1). */
  to?: string
  label?: string
}

export function BackButton({ to, label = 'Voltar' }: BackButtonProps) {
  const navigate = useNavigate()

  const className = `inline-flex items-center gap-1.5 text-xs font-semibold text-accent-blue
    border border-accent-blue/20 bg-accent-blue/5 rounded-lg px-3 py-1.5
    hover:bg-accent-blue/10 hover:border-accent-blue/40 transition-all duration-150`

  if (to) {
    return <Link to={to} className={className}>← {label}</Link>
  }

  return (
    <button type="button" onClick={() => navigate(-1)} className={className}>
      ← {label}
    </button>
  )
}
