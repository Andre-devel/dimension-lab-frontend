import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Carousel } from '@/components/ui/Carousel'
import { Reveal } from '@/components/ui/Reveal'
import { SEOHead, SITE_URL, SITE_NAME } from '@/components/seo/SEOHead'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioItem } from '@/types/portfolio'

const homeJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Impressão 3D profissional personalizada. Orçamento gratuito em até 24h.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/portfolio`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    description: 'Serviço de impressão 3D personalizada com materiais PLA, PETG e resina.',
    url: SITE_URL,
    image: `${SITE_URL}/logo.jpeg`,
    priceRange: '$$',
    areaServed: 'Brasil',
    serviceType: 'Impressão 3D',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Serviços de Impressão 3D',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Impressão 3D em PLA' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Impressão 3D em PETG' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Impressão 3D em Resina' } },
      ],
    },
  },
]

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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)

  // ── Canvas cube animation ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const ctx = canvas.getContext('2d')!
    const DPR = window.devicePixelRatio || 1
    let W = 0, H = 0, cx = 0, cy = 0

    const SHAPE: { x: number; y: number; z: number }[] = []
    const COUNT = 260

    function genCube() {
      SHAPE.length = 0
      const s = Math.min(W, H) * 0.22
      const verts: { x: number; y: number; z: number }[] = []
      for (let x = -1; x <= 1; x += 2)
        for (let y = -1; y <= 1; y += 2)
          for (let z = -1; z <= 1; z += 2)
            verts.push({ x: x * s, y: y * s, z: z * s })

      for (const v of verts)
        for (let i = 0; i < 4; i++)
          SHAPE.push({ x: v.x + (Math.random() - .5) * 8, y: v.y + (Math.random() - .5) * 8, z: v.z + (Math.random() - .5) * 8 })

      const edges = [[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]]
      for (const [a, b] of edges)
        for (let i = 1; i < 10; i++) {
          const t = i / 10
          SHAPE.push({
            x: verts[a].x + (verts[b].x - verts[a].x) * t + (Math.random() - .5) * 4,
            y: verts[a].y + (verts[b].y - verts[a].y) * t + (Math.random() - .5) * 4,
            z: verts[a].z + (verts[b].z - verts[a].z) * t + (Math.random() - .5) * 4,
          })
        }

      const faces = [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]]
      for (const [a, b, c, d] of faces)
        for (let i = 0; i < 6; i++) {
          const u = Math.random(), v = Math.random()
          const p1x = verts[a].x + (verts[b].x - verts[a].x) * u
          const p1y = verts[a].y + (verts[b].y - verts[a].y) * u
          const p1z = verts[a].z + (verts[b].z - verts[a].z) * u
          const p2x = verts[d].x + (verts[c].x - verts[d].x) * u
          const p2y = verts[d].y + (verts[c].y - verts[d].y) * u
          const p2z = verts[d].z + (verts[c].z - verts[d].z) * u
          SHAPE.push({
            x: p1x + (p2x - p1x) * v + (Math.random() - .5) * 3,
            y: p1y + (p2y - p1y) * v + (Math.random() - .5) * 3,
            z: p1z + (p2z - p1z) * v + (Math.random() - .5) * 3,
          })
        }

      while (SHAPE.length < COUNT)
        SHAPE.push({ x: (Math.random() - .5) * s * 1.6, y: (Math.random() - .5) * s * 1.6, z: (Math.random() - .5) * s * 1.6 })
    }

    function ease(t: number) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }

    interface Particle { x: number; y: number; z: number; size: number; hue: number; alpha: number; vx: number; vy: number; vz: number }
    const particles: Particle[] = []

    function initParticles() {
      particles.length = 0
      const spread = Math.min(W || 500, H || 500) * 1.2
      for (let i = 0; i < COUNT; i++)
        particles.push({
          x: (Math.random() - .5) * spread, y: (Math.random() - .5) * spread, z: (Math.random() - .5) * spread,
          size: 1 + Math.random() * 2.2,
          hue: [195, 210, 230, 270][Math.floor(Math.random() * 4)],
          alpha: .35 + Math.random() * .65,
          vx: 0, vy: 0, vz: 0,
        })
    }

    let mouseX = -9999, mouseY = -9999

    function onMouseMove(e: MouseEvent) {
      const rect = wrap!.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    function onMouseLeave() { mouseX = -9999; mouseY = -9999 }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    function resize() {
      const rect = wrap!.getBoundingClientRect()
      W = rect.width; H = rect.height
      canvas!.width = W * DPR; canvas!.height = H * DPR
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      cx = W / 2; cy = H / 2
      genCube()
    }

    const FORM_DURATION = 2000 // ms para formar o cubo
    const startTime = performance.now()
    let rafId: number

    function frame(time: number) {
      rafId = requestAnimationFrame(frame)
      if (!W) return
      ctx.clearRect(0, 0, W, H)

      const elapsed = time - startTime
      const rotY = elapsed * .0004
      const rotX = Math.sin(elapsed * .0002) * .3

      const prog = Math.min(1, ease(elapsed / FORM_DURATION))

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)

      const projected: { i: number; px: number; py: number; sc: number; z: number; size: number; hue: number; alpha: number }[] = []

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i]
        const sp = SHAPE[i % SHAPE.length]

        let tx = sp.x * cosY - sp.z * sinY
        let tz = sp.x * sinY + sp.z * cosY
        let ty = sp.y * cosX - tz * sinX
        tz = sp.y * sinX + tz * cosX

        p.vx *= .85; p.vy *= .85; p.vz *= .85
        const spd = .04 + prog * .08
        p.x += (tx - p.x) * spd; p.y += (ty - p.y) * spd; p.z += (tz - p.z) * spd

        const fov = 600, sc = fov / (fov + p.z)
        const px = cx + p.x * sc, py = cy + p.y * sc
        const dx = px - mouseX, dy = py - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120 && dist > 0) { const f = (120 - dist) / 120 * 4; p.x += (dx / dist) * f; p.y += (dy / dist) * f }

        projected.push({ i, px, py, sc, z: p.z, size: p.size, hue: p.hue, alpha: p.alpha })
      }

      projected.sort((a, b) => a.z - b.z)

      if (prog > .3) {
        const lineAlpha = (prog - .3) / .7 * .18
        const maxD = 55 * (Math.min(W, H) / 500)
        ctx.lineWidth = .6
        for (let i = 0; i < projected.length; i++) {
          const a = projected[i]
          for (let j = i + 1; j < Math.min(i + 20, projected.length); j++) {
            const b = projected[j]
            const d = Math.hypot(a.px - b.px, a.py - b.py)
            if (d < maxD) {
              ctx.strokeStyle = `rgba(0,170,255,${(1 - d / maxD) * lineAlpha})`
              ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py); ctx.stroke()
            }
          }
        }
      }

      for (const p of projected) {
        const bright = 45 + p.sc * 35, a = p.alpha * Math.min(1, p.sc)
        ctx.beginPath(); ctx.arc(p.px, p.py, p.size * p.sc * 4, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},100%,${bright}%,${a * .06})`; ctx.fill()
        ctx.beginPath(); ctx.arc(p.px, p.py, p.size * p.sc, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},100%,${bright}%,${a})`; ctx.fill()
      }
    }

    resize()
    initParticles()

    const ro = new ResizeObserver(() => { resize(); initParticles() })
    ro.observe(wrap)

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  // ── Portfolio ──────────────────────────────────────────────────────────────
  useEffect(() => {
    portfolioService.list()
      .then(items => setPortfolioItems(items))
      .catch(() => {})
      .finally(() => setPortfolioLoading(false))
  }, [])

  return (
    <PageWrapper>
      <SEOHead
        title="Impressão 3D Personalizada"
        description="Dimension.Lab3D — Impressão 3D profissional com PLA, PETG e resina. Orçamento gratuito em até 24h. Envie seu arquivo e receba na sua porta."
        canonical="/"
        jsonLd={homeJsonLd}
      />

      {/* ─── HERO ─── */}
      <section
        className="relative flex flex-col lg:flex-row lg:items-center lg:justify-center overflow-hidden"
        style={{ padding: 'clamp(16px, 4vw, 40px) 5%' }}
      >
        <div className="hero-grid" />
        <div className="hero-bg" />

        {/* Left */}
        <div className="relative z-10 max-w-[620px]">
          <div
            className="hero-badge"
            style={{ animation: 'fadeUp .6s ease 0s both' }}
          >
            <span className="badge-dot" />
            Impressão 3D Personalizada
          </div>

          <h1
            className="font-heading font-black leading-tight mb-5"
            style={{ fontSize: 'clamp(1.7rem, 5vw, 3.8rem)', animation: 'fadeUp .6s ease .1s both' }}
          >
            {/* Mobile */}
            <span className="sm:hidden">
              Impressão 3D{' '}
              <span style={{
                background: 'linear-gradient(100deg, rgb(var(--c-accent-cyan)), rgb(var(--c-accent-blue)), rgb(var(--c-accent-purple)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>sob medida.</span>
            </span>
            {/* Desktop */}
            <span className="hidden sm:inline">
              Seu projeto em 3D,{' '}
              <br />
              orçamento em 24h{' '}
              <br />
              <span style={{
                background: 'linear-gradient(100deg, rgb(var(--c-accent-cyan)), rgb(var(--c-accent-blue)), rgb(var(--c-accent-purple)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>e entrega no prazo.</span>
            </span>
          </h1>

          <p
            className="text-text-secondary mb-8 max-w-[480px] text-lg leading-relaxed"
            style={{ animation: 'fadeUp .6s ease .2s both' }}
          >
            Envie seu arquivo, acompanhe em tempo real e receba no prazo combinado.
          </p>

          <div
            className="flex gap-3 w-fit"
            style={{ animation: 'fadeUp .6s ease .3s both' }}
          >
            <Link
              to="/quote"
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-glow"
              style={{ background: 'linear-gradient(135deg, rgb(var(--c-accent-cyan)), rgb(var(--c-accent-blue)) 50%, rgb(var(--c-accent-purple)))' }}
            >
              Pedir Orçamento
            </Link>
            <Link
              to="/portfolio"
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition-all hover:text-text-primary hover:border-accent-blue/50 whitespace-nowrap"
            >
              Ver Portfólio
            </Link>
          </div>
        </div>

        {/* Canvas cubo partículas */}
        <div
          ref={wrapRef}
          className="relative w-full h-[240px] lg:mt-0 lg:flex-none lg:ml-10 lg:h-[480px] lg:w-[480px]"
        >
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        </div>
      </section>

      {/* ─── PORTFÓLIO PREVIEW ─── */}
      {(portfolioLoading || portfolioItems.length > 0) && (
        <section style={{ padding: 'clamp(48px, 8vw, 100px) 0', background: 'rgb(var(--c-background) / 0.6)' }}>
          <Reveal style={{ padding: '0 5%' }} className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgb(var(--c-accent-teal))', marginBottom: 6 }}>
                  Portfólio
                </p>
                <h2 className="hidden sm:block font-heading text-2xl lg:text-3xl font-bold text-text-primary">
                  Trabalhos recentes
                </h2>
              </div>
              <Link to="/portfolio" className="text-sm text-text-secondary hover:text-accent-blue transition-colors">
                Ver todos →
              </Link>
            </div>
          </Reveal>

          {portfolioLoading ? (
            <div style={{ padding: '0 5%' }} className="flex gap-6 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-card bg-surface-2 animate-pulse flex-shrink-0" style={{ width: 200, height: 280 }} />
              ))}
            </div>
          ) : (
            <Carousel items={portfolioItems.slice(0, 10)} />
          )}
        </section>
      )}

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="bg-surface" style={{ padding: 'clamp(40px, 8vw, 100px) 5%' }}>
        <Reveal>
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
        </Reveal>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
        >
          {steps.map(({ number, icon, title, description }, i) => (
            <Reveal key={number} delay={i * 80}>
              <div
                className="relative bg-surface-2 rounded-card border border-border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow overflow-hidden"
              >
                <span
                  className="absolute top-2 right-4 font-heading font-black select-none pointer-events-none"
                  style={{ fontSize: '5rem', lineHeight: 1, color: 'rgb(var(--c-accent-blue) / 0.07)' }}
                >
                  {number}
                </span>

                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-accent-blue/20 text-xl"
                  style={{ background: 'rgb(var(--c-accent-cyan) / .08)' }}
                >
                  {icon}
                </div>

                <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="relative overflow-hidden"
        style={{ padding: '100px 5%' }}
      >
        {/* Orb */}
        <div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgb(var(--c-accent-blue) / .12) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'orbFloat 8s ease-in-out infinite',
          }}
        />

        <Reveal className="relative z-10 mx-auto max-w-2xl">
          <div
            className="text-center rounded-2xl border border-accent-blue/20 px-6 py-10 lg:p-12"
            style={{ background: 'rgb(var(--c-accent-blue) / .04)' }}
          >
            <h2
              className="font-black text-text-primary mb-4"
              style={{ fontSize: 'clamp(1.4rem, 5vw, 2.8rem)' }}
            >
              Pronto para imprimir sua ideia?
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed max-w-md mx-auto">
              Orçamento gratuito em até 24h. Sem burocracia, sem surpresas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/quote"
                className="rounded-full px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-glow"
                style={{ background: 'linear-gradient(135deg, rgb(var(--c-accent-cyan)), rgb(var(--c-accent-blue)) 50%, rgb(var(--c-accent-purple)))' }}
              >
                Pedir Orçamento
              </Link>
              <Link
                to="/my-quotes"
                className="rounded-full border border-border px-6 py-3 font-semibold text-text-secondary transition-all hover:text-text-primary hover:border-accent-blue/50"
              >
                Meus pedidos
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </PageWrapper>
  )
}
