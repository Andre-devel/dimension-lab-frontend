import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'

const steps = [
  {
    number: '01',
    icon: '💬',
    title: 'Descreva sua ideia',
    description: 'Conte-nos o que você precisa: dimensões, material, quantidade e prazo desejado.',
  },
  {
    number: '02',
    icon: '📎',
    title: 'Envie referências',
    description: 'Compartilhe imagens, arquivos STL/OBJ ou qualquer referência que ajude na compreensão.',
  },
  {
    number: '03',
    icon: '💡',
    title: 'Receba o orçamento',
    description: 'Em até 24h enviamos um orçamento detalhado diretamente no seu WhatsApp.',
  },
  {
    number: '04',
    icon: '📦',
    title: 'Aprovação e entrega',
    description: 'Após aprovação iniciamos a impressão e entregamos no prazo combinado.',
  },
]

const testimonials = [
  {
    quote:
      'Encomendei peças para meu projeto de robótica e fiquei impressionado com a qualidade. Entrega rápida e comunicação excelente!',
    name: 'Carlos Mendes',
    city: 'São Paulo, SP',
    initial: 'C',
  },
  {
    quote:
      'Precisei de protótipos para minha startup e o Dimension.Lab3D superou todas as expectativas. Recomendo demais!',
    name: 'Ana Lima',
    city: 'Rio de Janeiro, RJ',
    initial: 'A',
  },
  {
    quote:
      'Qualidade incrível nas miniaturas que pedi. Detalhes perfeitos e material de excelente qualidade. Já fiz vários pedidos!',
    name: 'Pedro Oliveira',
    city: 'Belo Horizonte, MG',
    initial: 'P',
  },
]

export default function Home() {
  return (
    <PageWrapper>
      {/* ─── HERO ─── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '100vh', padding: '120px 5% 80px' }}
      >
        {/* Animated background layers */}
        <div className="hero-grid" />
        <div className="hero-bg" />

        {/* Left content */}
        <div className="relative z-10 max-w-[620px]">
          {/* Badge */}
          <div className="hero-badge">
            <span className="badge-dot" />
            Impressão 3D Personalizada
          </div>

          {/* H1 */}
          <h1
            className="font-heading font-black leading-tight mb-5"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
          >
            Sua ideia,{' '}
            <em className="text-accent-blue not-italic">impressa</em>
            {' '}em 3D com precisão
          </h1>

          {/* Subtitle */}
          <p className="text-text-secondary mb-8 max-w-[480px] text-lg leading-relaxed">
            Do protótipo à peça final — impressão 3D profissional em PLA, PETG, ABS, Resina e
            muito mais. Entregamos qualidade, rapidez e atenção a cada detalhe.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link
              to="/quote"
              className="rounded-full bg-accent-blue px-7 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              Pedir Orçamento
            </Link>
            <Link
              to="/portfolio"
              className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-text-secondary transition-all hover:text-text-primary hover:border-accent-blue/50"
            >
              Ver Portfólio
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { value: '500+', label: 'Projetos Entregues' },
              { value: '48h', label: 'Entrega Média' },
              { value: '4.9★', label: 'Avaliação' },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="text-accent-blue font-extrabold text-3xl leading-none">
                  {value}
                </span>
                <span className="text-text-secondary text-xs mt-1">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — 3D Cube (hidden on mobile) */}
        <div className="cube-wrap hidden lg:block">
          <div className="glow-ring" />
          <div className="glow-ring" />
          <div className="glow-ring" />
          <div className="cube">
            <div className="face front">⬡</div>
            <div className="face back">◈</div>
            <div className="face left">◉</div>
            <div className="face right">⬡</div>
            <div className="face top">◈</div>
            <div className="face bottom">◉</div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="bg-surface" style={{ padding: '100px 5%' }}>
        <p className="text-accent-blue text-xs font-semibold uppercase tracking-[0.15em] mb-3">
          Processo
        </p>
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-3">
          Como funciona?
        </h2>
        <p className="text-text-secondary max-w-[500px] mb-12 leading-relaxed">
          Do primeiro contato à entrega na sua porta — um processo simples, transparente e
          focado na sua satisfação.
        </p>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {steps.map(({ number, icon, title, description }) => (
            <div
              key={number}
              className="relative bg-surface-2 rounded-card border border-border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow overflow-hidden"
            >
              {/* Watermark number */}
              <span
                className="absolute top-2 right-4 font-heading font-black select-none pointer-events-none"
                style={{ fontSize: '5rem', lineHeight: 1, color: 'rgba(77,159,255,0.07)' }}
              >
                {number}
              </span>

              {/* Icon */}
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-accent-blue/10 border border-accent-blue/20 text-xl">
                {icon}
              </div>

              <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-surface" style={{ padding: '100px 5%' }}>
        <p className="text-accent-blue text-xs font-semibold uppercase tracking-[0.15em] mb-3">
          Depoimentos
        </p>
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-12">
          O que dizem nossos clientes
        </h2>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {testimonials.map(({ quote, name, city, initial }) => (
            <div
              key={name}
              className="bg-surface-2 rounded-card border border-border p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <span className="text-accent-blue text-lg tracking-wide">★★★★★</span>

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed flex-1">"{quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-blue text-white font-bold text-sm flex-shrink-0">
                  {initial}
                </div>
                <div>
                  <p className="text-text-primary text-sm font-semibold">{name}</p>
                  <p className="text-text-secondary text-xs">{city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}