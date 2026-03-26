import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BackButton } from '@/components/ui/BackButton'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock, Layers, Box, Truck, MessageCircle } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'
import { DatePicker } from '@/components/ui/DatePicker'
import { FileUploadZone } from '@/components/ui/FileUploadZone'
import { quoteService } from '@/services/quoteService'
import { fileUrl } from '@/utils/fileUrl'
import { materialService, colorService } from '@/services/catalogService'
import type { Material, Color } from '@/types/catalog'
import { useAuthStore } from '@/store/authStore'

interface PortfolioRef {
  id: string
  title: string
  material: string
  photo: string | null
}

const quoteJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Solicitar Orçamento', item: `${SITE_URL}/quote` },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Orçamento de Impressão 3D',
    description: 'Solicite um orçamento gratuito para impressão 3D personalizada. Resposta em até 24h via WhatsApp.',
    provider: { '@type': 'LocalBusiness', name: 'Dimension.Lab3D', url: SITE_URL },
    areaServed: 'Brasil',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', description: 'Orçamento gratuito' },
  },
]

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

const schema = z.object({
  description: z.string().optional(),
  material: z.string({ required_error: 'Selecione um material' }).min(1, 'Selecione um material'),
  color: z.string({ required_error: 'Selecione uma cor' }).min(1, 'Selecione uma cor'),
  quantity: z.coerce.number({ invalid_type_error: 'Informe a quantidade' }).min(1, 'Mínimo 1 unidade'),
  desiredDeadline: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  customerPhone: z.string()
    .refine(v => !v || digitsOnly(v).length >= 10, 'Número inválido, informe com DDD')
    .refine(v => !v || digitsOnly(v).length <= 11, 'Número inválido')
    .optional(),
})

type FormValues = z.infer<typeof schema>

const ACCEPT = '.jpg,.jpeg,.png,.mp4,.stl,.obj'
const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL as string | undefined

const benefits = [
  { Icon: Clock,  color: '#22d3ee', bg: 'rgba(34,211,238,.1)',  label: 'Resposta em 24h',       desc: 'Orçamento rápido e detalhado' },
  { Icon: Layers, color: '#fbbf24', bg: 'rgba(251,191,36,.1)',  label: 'Orçamento gratuito',     desc: 'Sem custo para solicitar' },
  { Icon: Box,    color: '#60a5fa', bg: 'rgba(96,165,250,.1)',  label: 'Modelagem inclusa',      desc: 'Ajudamos com o arquivo 3D' },
  { Icon: Truck,  color: '#34d399', bg: 'rgba(52,211,153,.1)',  label: 'Envio nacional',         desc: 'Entregamos em qualquer estado' },
]

const checklist = [
  { color: '#22d3ee', bg: 'rgba(34,211,238,.1)', strong: 'Envie seu projeto',       desc: 'Preencha o formulário com os detalhes' },
  { color: '#fbbf24', bg: 'rgba(251,191,36,.1)', strong: 'Análise em até 24h',      desc: 'Avaliamos viabilidade e custo' },
  { color: '#60a5fa', bg: 'rgba(96,165,250,.1)', strong: 'Receba o orçamento',      desc: 'Valor detalhado via WhatsApp' },
  { color: '#34d399', bg: 'rgba(52,211,153,.1)', strong: 'Aprovação e produção',    desc: 'Início imediato após confirmação' },
]

function initials(name?: string | null, email?: string | null) {
  if (name) return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#8899aa', marginBottom: 6, letterSpacing: '.3px' }}
    >
      {children}
    </label>
  )
}

function StepLabel({ step, title }: { step: string; title: string }) {
  return (
    <>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#556677', marginBottom: 4 }}>
        {step}
      </p>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e8edf3', marginBottom: '1.25rem' }}>
        {title}
      </h2>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d1520',
  border: '1px solid rgba(56,189,248,.08)',
  borderRadius: 10,
  color: '#e8edf3',
  fontSize: 14,
  padding: '11px 14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color .2s, box-shadow .2s',
}

const QInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  function QInput({ hasError, ...rest }, ref) {
    const [focused, setFocused] = useState(false)
    return (
      <input
        ref={ref}
        {...rest}
        style={{
          ...inputStyle,
          borderColor: hasError ? '#fb7185' : focused ? '#06b6d4' : 'rgba(56,189,248,.08)',
          boxShadow: focused ? '0 0 0 3px rgba(6,182,212,.1)' : 'none',
          ...(rest.type === 'number' ? { MozAppearance: 'textfield' } : {}),
        }}
        className={rest.type === 'number' ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : rest.className}
        onFocus={e => { setFocused(true); rest.onFocus?.(e) }}
        onBlur={e => { setFocused(false); rest.onBlur?.(e) }}
      />
    )
  }
)

function QTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  const { hasError, ...rest } = props
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      {...rest}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: 90,
        borderColor: hasError ? '#fb7185' : focused ? '#06b6d4' : 'rgba(56,189,248,.08)',
        boxShadow: focused ? '0 0 0 3px rgba(6,182,212,.1)' : 'none',
      }}
      onFocus={e => { setFocused(true); rest.onFocus?.(e) }}
      onBlur={e => { setFocused(false); rest.onBlur?.(e) }}
    />
  )
}


function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{
      display: 'flex',
      background: '#0a0f1a',
      border: '1px solid rgba(56,189,248,.1)',
      borderRadius: 10,
      padding: 3,
      gap: 2,
    }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 7,
            border: 'none',
            background: value === opt ? '#06b6d4' : 'transparent',
            color: value === opt ? '#fff' : '#8899aa',
            fontSize: 13,
            fontWeight: value === opt ? 600 : 500,
            cursor: 'pointer',
            transition: 'background .18s, color .18s',
            whiteSpace: 'nowrap',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ColorSwatch({ name, hex, selected, onClick }: { name: string; hex: string | null; selected: boolean; onClick: () => void }) {
  const isTransparent = name.toLowerCase() === 'transparente'

  if (!hex) {
    // Multicor
    return (
      <button
        type="button"
        title={name}
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 20,
          border: selected ? '2px solid #06b6d4' : '2px solid rgba(56,189,248,.08)',
          background: selected ? 'rgba(6,182,212,.1)' : '#0d1520',
          color: selected ? '#22d3ee' : '#8899aa',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          transition: 'all .18s',
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', flexShrink: 0 }} />
        {name}
      </button>
    )
  }

  const checkerboard = isTransparent
    ? {
        backgroundImage: `
          linear-gradient(45deg, #444 25%, transparent 25%),
          linear-gradient(-45deg, #444 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #444 75%),
          linear-gradient(-45deg, transparent 75%, #444 75%)
        `,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        backgroundColor: '#888',
      }
    : { background: hex }

  return (
    <button
      type="button"
      title={name}
      onClick={onClick}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        ...checkerboard,
        border: selected ? `3px solid ${hex}` : '2px solid rgba(255,255,255,.12)',
        cursor: 'pointer',
        transition: 'box-shadow .18s, border-color .18s',
        boxShadow: selected ? `0 0 0 2px #0c1219, 0 0 0 4px ${hex}` : 'none',
        outline: 'none',
        flexShrink: 0,
      }}
    />
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QuoteRequest() {
  const { isAuthenticated, user, setUser } = useAuthStore()
  const location = useLocation()
  const portfolioRef = (location.state as { portfolioItem?: PortfolioRef } | null)?.portfolioItem ?? null
  const [files, setFiles] = useState<File[]>([])
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [projectError, setProjectError] = useState('')
  const [shakingFields, setShakingFields] = useState<Set<string>>(new Set())

  function triggerShake(fields: string[], focusId?: string) {
    setShakingFields(new Set())
    requestAnimationFrame(() => {
      setShakingFields(new Set(fields))
      setTimeout(() => setShakingFields(new Set()), 450)
    })
    if (focusId) requestAnimationFrame(() => {
      const el = document.getElementById(focusId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.focus()
    })
  }

  function sc(field: string) {
    return shakingFields.has(field) ? 'field-shake' : undefined
  }
  const [materials, setMaterials] = useState<Material[]>([])
  const [colors, setColors] = useState<Color[]>([])

  useEffect(() => {
    materialService.listActive().then(setMaterials).catch(() => {})
    colorService.listActive().then(setColors).catch(() => {})
  }, [])

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, material: portfolioRef?.material ?? 'PLA', color: '', desiredDeadline: '' },
  })

  async function onSubmit(data: FormValues) {
    setSubmitError('')
    setProjectError('')

    const desc = data.description?.trim() ?? ''
    if (!desc && files.length === 0 && !portfolioRef) {
      setProjectError('Informe uma descrição ou envie pelo menos um arquivo do projeto.')
      triggerShake(['_project'], 'description')
      return
    }
    if (desc && desc.length < 10) {
      setProjectError('A descrição precisa ter pelo menos 10 caracteres.')
      triggerShake(['_project'], 'description')
      return
    }

    if (!isAuthenticated) {
      const contactErrors: string[] = []
      if (!data.customerName?.trim()) {
        setError('customerName', { message: 'Informe seu nome' })
        contactErrors.push('customerName')
      }
      if (!data.customerEmail?.trim()) {
        setError('customerEmail', { message: 'Informe seu e-mail' })
        contactErrors.push('customerEmail')
      }
      if (contactErrors.length > 0) {
        triggerShake(contactErrors, contactErrors[0])
        return
      }
    }

    const needsWhatsapp = !isAuthenticated || !user?.phone
    if (needsWhatsapp && (!data.customerPhone || digitsOnly(data.customerPhone).length < 10)) {
      setSubmitError('Informe seu WhatsApp com DDD.')
      triggerShake(['customerPhone'], 'customerPhone')
      return
    }
    try {
      await quoteService.create({
        ...data,
        description: data.description ?? '',
        desiredDeadline: data.desiredDeadline ?? '',
        customerName: isAuthenticated ? user?.name : data.customerName,
        customerEmail: isAuthenticated ? user?.email : data.customerEmail,
        customerPhone: data.customerPhone ? digitsOnly(data.customerPhone) : undefined,
        files,
        portfolioItemId: portfolioRef?.id,
      })
      if (isAuthenticated && user && !user.phone && data.customerPhone) {
        setUser({ ...user, phone: data.customerPhone })
      }
      setSuccess(true)
      reset()
      setFiles([])
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; details?: string[] } } })?.response?.data
      const msg = data?.details?.[0] ?? data?.message ?? 'Erro ao enviar orçamento. Tente novamente.'
      setSubmitError(msg)
    }
  }


  if (success) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)', padding: '80px 5%' }}>
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">Orçamento enviado!</h2>
            <p className="text-text-secondary mb-8">Entraremos em contato em breve.</p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="rounded-full border border-border px-7 py-3 text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-accent-blue/50 transition-all"
            >
              Fazer outro pedido
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  const colorOptions: Array<{ value: string; hex: string | null }> = [
    { value: 'Multicor', hex: null },
    ...colors.map(c => ({ value: c.name, hex: c.hex })),
  ]

  return (
    <PageWrapper>
      <SEOHead
        title="Solicitar Orçamento"
        description="Solicite um orçamento gratuito de impressão 3D. Envie seu arquivo STL/OBJ, escolha material e cor. Resposta em até 24h no seu WhatsApp."
        canonical="/quote"
        jsonLd={quoteJsonLd}
      />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '3rem 5% 4rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <BackButton />
        </div>

        {/* ── Page header ── */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#06b6d4', marginBottom: 8 }}>
            Orçamento
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-.5px', color: '#e8edf3', marginBottom: 8 }}>
            Solicitar Orçamento
          </h1>
          <p style={{ fontSize: 14, color: '#8899aa', maxWidth: 440, margin: '0 auto' }}>
            Preencha os detalhes do seu projeto e receba um orçamento personalizado em até 24 horas.
          </p>
        </div>

        {/* ── Benefits strip ── */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
          style={{ marginBottom: '2.5rem' }}
        >
          {benefits.map(({ Icon, color, bg, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: '#0c1219', border: '1px solid rgba(56,189,248,.08)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 6, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf3', lineHeight: 1.3 }}>{label}</p>
                <p className="hidden sm:block" style={{ fontSize: 11, color: '#556677', lineHeight: 1.3, marginTop: 2 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main grid: form + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── Form card ── */}
          <div
            className="p-5 sm:p-8"
            style={{
              background: '#0c1219',
              border: '1px solid rgba(56,189,248,.08)',
              borderRadius: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* top gradient line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #06b6d4, #3b82f6, transparent)' }} />

            <form onSubmit={handleSubmit(onSubmit, (errs) => {
              const fields = Object.keys(errs)
              const focusMap: Record<string, string> = { description: 'description', color: 'color-field', quantity: 'quantity', desiredDeadline: 'desiredDeadline', customerName: 'customerName', customerEmail: 'customerEmail', customerPhone: 'customerPhone' }
              triggerShake(fields, focusMap[fields[0]])
            })} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

              {/* ── Section 1: Project ── */}
              <div >
                <StepLabel step="Etapa 01 — Projeto" title="Detalhes do projeto" />

                {/* Description + Files (ao menos um obrigatório) */}
                <div className={sc('_project')} style={{ marginBottom: '1rem', background: 'rgba(56,189,248,.03)', border: '1px solid rgba(56,189,248,.07)', borderRadius: 12, padding: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <FieldLabel htmlFor="description">Descrição do projeto</FieldLabel>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <QTextarea
                          id="description"
                          rows={3}
                          placeholder="Descreva dimensões, acabamento, referências ou qualquer detalhe importante..."
                          hasError={!!projectError}
                          {...field}
                        />
                      )}
                    />
                  </div>

                  {/* OR divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0.75rem 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,.1)' }} />
                    <span style={{ fontSize: 11, color: '#556677', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>OU</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,.1)' }} />
                  </div>

                  {portfolioRef ? (
                    <div>
                      <FieldLabel>Referência do portfólio</FieldLabel>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: 'rgba(6,182,212,.06)',
                        border: '1px solid rgba(6,182,212,.2)',
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                        {portfolioRef.photo && (
                          <img
                            src={fileUrl(portfolioRef.photo)}
                            alt={portfolioRef.title}
                            style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {portfolioRef.title}
                          </p>
                          <p style={{ fontSize: 12, color: '#06b6d4', marginTop: 2 }}>{portfolioRef.material}</p>
                        </div>
                        <Link
                          to={`/portfolio/${portfolioRef.id}`}
                          style={{ fontSize: 11, color: '#8899aa', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          Ver item →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FieldLabel>Arquivos do projeto</FieldLabel>
                      <FileUploadZone onFilesChange={(f) => { setFiles(f); if (f.length > 0) setProjectError('') }} accept={ACCEPT} />
                    </div>
                  )}

                  {projectError && (
                    <p style={{ fontSize: 12, color: '#fb7185', marginTop: 8 }}>{projectError}</p>
                  )}
                </div>

                {/* Material segmented control */}
                <div className={sc('material')} style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Material</FieldLabel>
                  <Controller
                    control={control}
                    name="material"
                    render={({ field }) => (
                      <SegmentedControl
                        options={materials.map(m => m.name)}
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.material && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.material.message}</p>}
                </div>

                {/* Color swatches */}
                <div id="color-field" className={sc('color')} style={{ marginBottom: '1rem' }}>
                  <FieldLabel>Cor</FieldLabel>
                  <Controller
                    control={control}
                    name="color"
                    render={({ field }) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        {colorOptions.map(c => (
                          <ColorSwatch
                            key={c.value}
                            name={c.value}
                            hex={c.hex}
                            selected={field.value === c.value}
                            onClick={() => field.onChange(c.value)}
                          />
                        ))}
                      </div>
                    )}
                  />
                  {errors.color && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.color.message}</p>}
                </div>

                {/* Quantity + Deadline */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className={sc('quantity')} style={{ flex: '0 0 120px' }}>
                    <FieldLabel htmlFor="quantity">Quantidade <span style={{ color: '#06b6d4' }}>*</span></FieldLabel>
                    <Controller
                      control={control}
                      name="quantity"
                      render={({ field }) => (
                        <QInput
                          id="quantity"
                          type="number"
                          min={1}
                          hasError={!!errors.quantity}
                          {...field}
                          value={field.value ?? 1}
                          onChange={(e) => {
                            const n = e.target.valueAsNumber
                            field.onChange(isNaN(n) ? '' : n)
                          }}
                        />
                      )}
                    />
                    {errors.quantity && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.quantity.message}</p>}
                  </div>
                  <div className={sc('desiredDeadline')} style={{ flex: 1, minWidth: 240 }}>
                    <FieldLabel htmlFor="desiredDeadline">Prazo desejado</FieldLabel>
                    <Controller
                      control={control}
                      name="desiredDeadline"
                      render={({ field }) => (
                        <DatePicker
                          id="desiredDeadline"
                          label=""
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={errors.desiredDeadline?.message}
                        />
                      )}
                    />
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div style={{ margin: '2.25rem 0', height: 1, background: 'linear-gradient(90deg, transparent, rgba(56,189,248,.3), transparent)' }} />

              {/* ── Section 2: Contact ── */}
              <div style={{ marginBottom: '1.5rem' }}>
                <StepLabel step="Etapa 02 — Contato" title="Seus dados" />

                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* User card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111a24', border: '1px solid rgba(56,189,248,.08)', borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #0891b2, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                        {initials(user?.name, user?.email)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#e8edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? user?.email}</p>
                        <p style={{ fontSize: 12, color: '#8899aa', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                        {user?.phone && <p style={{ fontSize: 12, color: '#22d3ee', marginTop: 1 }}>{user.phone}</p>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', background: 'rgba(16,185,129,.1)', padding: '4px 10px', borderRadius: 6, letterSpacing: '.3px', flexShrink: 0 }}>
                        Logado
                      </span>
                    </div>

                    {!user?.phone && (
                      <div className={sc('customerPhone')}>
                        <FieldLabel htmlFor="customerPhone">Telefone (com DDD) <span style={{ color: '#06b6d4' }}>*</span></FieldLabel>
                        <Controller
                          control={control}
                          name="customerPhone"
                          render={({ field }) => (
                            <QInput
                              id="customerPhone"
                              type="tel"
                              placeholder="(00) 00000-0000"
                              hasError={!!errors.customerPhone}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            />
                          )}
                        />
                        {errors.customerPhone && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.customerPhone.message}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Nome — full width */}
                    <div className={sc('customerName')}>
                      <FieldLabel htmlFor="customerName">Seu nome</FieldLabel>
                      <QInput
                        id="customerName"
                        type="text"
                        placeholder="Nome completo"
                        hasError={!!errors.customerName}
                        {...register('customerName')}
                      />
                      {errors.customerName && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.customerName.message}</p>}
                    </div>
                    {/* Telefone + Email — lado a lado */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className={sc('customerPhone')} style={{ flex: 1 }}>
                        <FieldLabel htmlFor="customerPhone">Telefone (com DDD) <span style={{ color: '#06b6d4' }}>*</span></FieldLabel>
                        <Controller
                          control={control}
                          name="customerPhone"
                          render={({ field }) => (
                            <QInput
                              id="customerPhone"
                              type="tel"
                              placeholder="(00) 00000-0000"
                              hasError={!!errors.customerPhone}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            />
                          )}
                        />
                        {errors.customerPhone && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.customerPhone.message}</p>}
                      </div>
                      <div className={sc('customerEmail')} style={{ flex: 1 }}>
                        <FieldLabel htmlFor="customerEmail">E-mail</FieldLabel>
                        <QInput
                          id="customerEmail"
                          type="email"
                          placeholder="seu@email.com"
                          hasError={!!errors.customerEmail}
                          {...register('customerEmail')}
                        />
                        {errors.customerEmail && <p style={{ fontSize: 12, color: '#fb7185', marginTop: 4 }}>{errors.customerEmail.message}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {submitError && <p style={{ fontSize: 13, color: '#fb7185', marginBottom: 12 }}>{submitError}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: 10,
                  fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: '#fff',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', letterSpacing: '.3px',
                  background: 'linear-gradient(135deg, #0891b2, #3b82f6)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all .3s',
                  position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!isSubmitting) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px rgba(6,182,212,.25)' } }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '' }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                    Enviando...
                  </span>
                ) : 'Enviar orçamento'}
              </button>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#556677' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'q-pulse 2s ease infinite', display: 'inline-block' }} />
                Aceitando novos pedidos
              </div>

            </form>
          </div>

          {/* ── Sidebar ── */}
          <aside className="lg:sticky" style={{ top: 80 }}>

            {/* Checklist card */}
            <div style={{ background: '#0c1219', border: '1px solid rgba(56,189,248,.08)', borderRadius: 20, padding: '1.75rem', marginBottom: '1rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#06b6d4', marginBottom: 4 }}>
                Como funciona
              </p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8edf3', marginBottom: '.75rem' }}>
                Próximos passos
              </h3>
              <p style={{ fontSize: 13, color: '#8899aa', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                Após enviar seu orçamento, nossa equipe analisa os detalhes e retorna com valor, prazo e opções de acabamento.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {checklist.map(({ color, bg, strong, desc }) => (
                  <li key={strong} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#8899aa', lineHeight: 1.5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <span style={{ color: '#e8edf3', fontWeight: 600 }}>{strong}</span>
                      <br />{desc}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help card */}
            {WHATSAPP_URL && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, background: '#0c1219', border: '1px solid rgba(56,189,248,.08)', borderRadius: 20, padding: '1.25rem 1.5rem', transition: 'all .25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(56,189,248,.2)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(56,189,248,.08)'; (e.currentTarget as HTMLAnchorElement).style.transform = '' }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'rgba(34,211,238,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
                  <MessageCircle size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#e8edf3' }}>Precisa de ajuda?</p>
                  <p style={{ fontSize: 12, color: '#556677' }}>Fale conosco pelo WhatsApp</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#556677', fontSize: 16 }}>→</span>
              </a>
            )}

          </aside>

        </div>
      </div>
    </PageWrapper>
  )
}