import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message ?? null }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
          <span className="text-4xl">⚠️</span>
          <h1 className="text-xl font-heading font-bold text-text-primary">
            Algo deu errado
          </h1>
          <p className="text-text-secondary text-sm max-w-sm">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-btn bg-accent-blue text-white text-sm font-medium hover:shadow-glow transition-all"
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}