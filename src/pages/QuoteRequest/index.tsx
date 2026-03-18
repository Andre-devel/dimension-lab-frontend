import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MessageSquare, Layers, Palette, Hash,
  Calendar as CalendarIcon, UploadCloud, User, Phone, Mail,
} from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SEOHead, SITE_URL } from '@/components/seo/SEOHead'

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
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { FileUploadZone } from '@/components/ui/FileUploadZone'
import { quoteService } from '@/services/quoteService'
import { materialService, colorService } from '@/services/catalogService'
import type { Material, Color } from '@/types/catalog'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  material: z.string().min(1, 'Selecione um material'),
  color: z.string().min(1, 'Selecione uma cor'),
  quantity: z.number().min(1, 'Mínimo 1 unidade'),
  desiredDeadline: z.string().min(1, 'Informe o prazo'),
  customerName: z.string().optional(),
  customerEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  customerWhatsapp: z.string().min(10, 'Informe seu WhatsApp com DDD').optional(),
})

type FormValues = z.infer<typeof schema>

const ACCEPT = '.jpg,.jpeg,.png,.mp4,.stl,.obj'

// ── Helpers ─────────────────────────────────────────────────────────────────

function QLabel({ htmlFor, icon, children }: { htmlFor?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-heading flex items-center gap-1.5"
      style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(136,144,181,0.9)',
      }}
    >
      <span style={{ opacity: 0.55, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {children}
    </label>
  )
}

function qInput(hasError?: boolean): string {
  return [
    'q-input w-full rounded-[8px] px-4 py-[13px] text-sm text-text-primary placeholder:text-[#4a5080]',
    hasError ? '!border-red-500' : '',
  ].join(' ')
}

// ────────────────────────────────────────────────────────────────────────────

export default function QuoteRequest() {
  const { isAuthenticated, user, setUser } = useAuthStore()
  const [files, setFiles] = useState<File[]>([])
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1 },
  })

  async function onSubmit(data: FormValues) {
    setSubmitError('')
    const needsWhatsapp = !isAuthenticated || !user?.whatsapp
    if (needsWhatsapp && (!data.customerWhatsapp || data.customerWhatsapp.length < 10)) {
      setSubmitError('Informe seu WhatsApp com DDD.')
      return
    }
    try {
      await quoteService.create({ ...data, files })
      if (isAuthenticated && user && !user.whatsapp && data.customerWhatsapp) {
        setUser({ ...user, whatsapp: data.customerWhatsapp })
      }
      setSuccess(true)
      reset()
      setFiles([])
    } catch {
      setSubmitError('Erro ao enviar orçamento. Tente novamente.')
    }
  }

  if (success) {
    return (
      <PageWrapper>
        <div
          className="flex items-center justify-center"
          style={{ minHeight: 'calc(100vh - 80px)', padding: '80px 5%' }}
        >
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              Orçamento enviado!
            </h2>
            <p className="text-text-secondary mb-8">
              Entraremos em contato em breve.
            </p>
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

  return (
    <PageWrapper>
      <SEOHead
        title="Solicitar Orçamento"
        description="Solicite um orçamento gratuito de impressão 3D. Envie seu arquivo STL/OBJ, escolha material e cor. Resposta em até 24h no seu WhatsApp."
        canonical="/quote"
        jsonLd={quoteJsonLd}
      />
      <div style={{ padding: '100px 5% 80px' }}>
        <div
          className="grid gap-[60px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          {/* ── Left — info ───────────────────────────────────────────────── */}
          <div className="flex flex-col justify-center">
            <p className="text-accent-blue text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              Orçamento
            </p>
            <h1 className="font-heading text-3xl font-bold text-text-primary mb-4">
              Solicitar Orçamento
            </h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Pronto para dar vida à sua ideia? Preencha o formulário e receba um orçamento
              personalizado em até 24 horas.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: '⚡', title: 'Resposta em 24h',       desc: 'Orçamento rápido e detalhado' },
                { icon: '🎨', title: 'Qualquer filamento',    desc: 'PLA, PETG, ABS, Resina, TPU' },
                { icon: '📐', title: 'Modelagem inclusa',     desc: 'Ajudamos com o arquivo 3D' },
                { icon: '🚚', title: 'Envio para todo Brasil', desc: 'Entregamos em qualquer estado' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-accent-blue/10 border border-accent-blue/20 text-lg">
                    {icon}
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">{title}</p>
                    <p className="text-text-secondary text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — form card ─────────────────────────────────────────── */}
          <div
            style={{
              position: 'relative',
              background: 'rgba(15,16,35,0.97)',
              border: '1px solid rgba(30,33,80,0.65)',
              borderRadius: 20,
              padding: '36px 32px 28px',
              overflow: 'hidden',
            }}
          >
            {/* Gradient top bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(135deg, #00E5FF, #4D9FFF, #8B5CF6)',
              borderRadius: '20px 20px 0 0',
              pointerEvents: 'none',
            }} />

            {/* Corner accent — top right */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              width: 26, height: 26,
              borderTop: '1.5px solid rgba(0,229,255,0.25)',
              borderRight: '1.5px solid rgba(0,229,255,0.25)',
              borderRadius: '0 6px 0 0',
              pointerEvents: 'none',
            }} />

            {/* Corner accent — bottom left */}
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              width: 26, height: 26,
              borderBottom: '1.5px solid rgba(139,92,246,0.25)',
              borderLeft: '1.5px solid rgba(139,92,246,0.25)',
              borderRadius: '0 0 0 6px',
              pointerEvents: 'none',
            }} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <QLabel htmlFor="description" icon={<MessageSquare size={11} />}>
                  Detalhes do projeto
                </QLabel>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Descreva dimensões, acabamento, referências ou qualquer detalhe importante..."
                  {...register('description')}
                  className={qInput(!!errors.description) + ' resize-none'}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">{errors.description.message}</span>
                )}
              </div>

              {/* Material + Color */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <QLabel htmlFor="material" icon={<Layers size={11} />}>Material</QLabel>
                  <div className="q-field-override">
                    <Controller
                      control={control}
                      name="material"
                      render={({ field }) => (
                        <CustomSelect
                          id="material"
                          label=""
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={materials.map((m) => ({ value: m.name, label: m.name }))}
                          error={errors.material?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <QLabel htmlFor="color" icon={<Palette size={11} />}>Cor</QLabel>
                  <div className="q-field-override">
                    <Controller
                      control={control}
                      name="color"
                      render={({ field }) => (
                        <CustomSelect
                          id="color"
                          label=""
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={[
                            { value: 'Multicor', label: '🎨 Multicor (mais de uma cor)' },
                            ...colors.map((c) => ({ value: c.name, label: c.name })),
                          ]}
                          error={errors.color?.message}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Quantity + Deadline */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <QLabel htmlFor="quantity" icon={<Hash size={11} />}>Quantidade</QLabel>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    className={qInput(!!errors.quantity)}
                    {...register('quantity', { valueAsNumber: true })}
                  />
                  {errors.quantity && (
                    <span className="text-xs text-red-500">{errors.quantity.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <QLabel htmlFor="desiredDeadline" icon={<CalendarIcon size={11} />}>
                    Prazo desejado
                  </QLabel>
                  <div className="q-field-override">
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

              {/* Files */}
              <div className="flex flex-col gap-1.5">
                <QLabel icon={<UploadCloud size={11} />}>Arquivos do projeto</QLabel>
                <FileUploadZone onFilesChange={setFiles} accept={ACCEPT} />
              </div>

              {/* Customer data */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderRadius: 10,
                    border: '1px solid rgba(77,159,255,0.2)',
                    background: 'rgba(77,159,255,0.05)',
                    padding: '12px 16px',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, flexShrink: 0,
                      borderRadius: '50%',
                      background: 'rgba(77,159,255,0.2)',
                      color: '#4D9FFF', fontSize: 14,
                    }}>✓</div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {user?.name ?? user?.email}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {user?.email}
                        {user?.whatsapp && (
                          <span className="ml-2 text-accent-blue">{user.whatsapp}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!user?.whatsapp && (
                    <div className="flex flex-col gap-1.5">
                      <QLabel htmlFor="customerWhatsapp" icon={<Phone size={11} />}>
                        WhatsApp (com DDD)
                      </QLabel>
                      <input
                        id="customerWhatsapp"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className={qInput(!!errors.customerWhatsapp)}
                        {...register('customerWhatsapp')}
                      />
                      {errors.customerWhatsapp && (
                        <span className="text-xs text-red-500">{errors.customerWhatsapp.message}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="font-heading text-[10px] uppercase tracking-[0.15em] text-text-secondary">
                    Seus dados (opcional)
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <QLabel htmlFor="customerName" icon={<User size={11} />}>Seu nome</QLabel>
                      <input
                        id="customerName"
                        type="text"
                        placeholder="Nome completo"
                        className={qInput(!!errors.customerName)}
                        {...register('customerName')}
                      />
                      {errors.customerName && (
                        <span className="text-xs text-red-500">{errors.customerName.message}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <QLabel htmlFor="customerWhatsapp" icon={<Phone size={11} />}>WhatsApp</QLabel>
                      <input
                        id="customerWhatsapp"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className={qInput(!!errors.customerWhatsapp)}
                        {...register('customerWhatsapp')}
                      />
                      {errors.customerWhatsapp && (
                        <span className="text-xs text-red-500">{errors.customerWhatsapp.message}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <QLabel htmlFor="customerEmail" icon={<Mail size={11} />}>E-mail</QLabel>
                    <input
                      id="customerEmail"
                      type="email"
                      placeholder="seu@email.com"
                      className={qInput(!!errors.customerEmail)}
                      {...register('customerEmail')}
                    />
                    {errors.customerEmail && (
                      <span className="text-xs text-red-500">{errors.customerEmail.message}</span>
                    )}
                  </div>
                </div>
              )}

              {submitError && <p className="text-sm text-red-500">{submitError}</p>}

              {/* Divider */}
              <div
                className="flex items-center gap-3"
                style={{ color: 'rgba(74,80,128,0.7)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}
              >
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(30,33,80,0.9), transparent)' }} />
                <span className="font-heading">enviar</span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(30,33,80,0.9), transparent)' }} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="q-submit-btn font-heading"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar Orçamento'
                )}
              </button>
            </form>

            {/* Status bar */}
            <div
              className="flex items-center justify-center gap-1.5"
              style={{ marginTop: 20, color: 'rgba(74,80,128,0.7)', fontSize: 12, letterSpacing: '0.05em' }}
            >
              <span className="q-status-dot" />
              Aceitando novos pedidos
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
