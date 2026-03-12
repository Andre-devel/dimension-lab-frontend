import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="font-heading text-6xl font-bold leading-tight sm:text-7xl lg:text-8xl">
          <span className="text-text-primary">DIMENSION</span>
          <span className="bg-gradient-to-r from-[#4D9FFF] to-[#8B5CF6] bg-clip-text text-transparent">
            .LAB3D
          </span>
        </h1>

        <p className="max-w-md font-heading text-lg text-text-secondary sm:text-xl">
          Impressão 3D profissional sob medida
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link to="/quote">
            <Button variant="primary" className="min-w-[180px]">
              Solicitar Orçamento
            </Button>
          </Link>
          <Link to="/portfolio">
            <Button variant="secondary" className="min-w-[180px]">
              Ver Portfólio
            </Button>
          </Link>
        </div>
      </section>
    </PageWrapper>
  )
}