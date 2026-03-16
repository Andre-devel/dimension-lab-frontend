import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FileUploadZone } from '@/components/ui/FileUploadZone'
import { quoteService } from '@/services/quoteService'
import { MATERIALS, FINISHES } from '@/constants/quoteStatus'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  material: z.string().min(1, 'Selecione um material'),
  color: z.string().min(1, 'Informe a cor'),
  quantity: z.number().min(1, 'Mínimo 1 unidade'),
  finish: z.string().min(1, 'Selecione um acabamento'),
  desiredDeadline: z.string().min(1, 'Informe o prazo'),
  customerName: z.string().optional(),
  customerEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  customerWhatsapp: z.string().min(10, 'Informe seu WhatsApp com DDD').optional(),
})

type FormValues = z.infer<typeof schema>

const ACCEPT = '.jpg,.jpeg,.png,.mp4,.stl,.obj'

const inputCls = (hasError: boolean) =>
  [
    'w-full rounded-btn border bg-surface-2 px-3 py-2 text-sm text-text-primary outline-none',
    'placeholder:text-text-secondary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors',
    hasError ? 'border-red-500' : 'border-border',
  ].join(' ')

export default function QuoteRequest() {
  const { isAuthenticated, user, setUser } = useAuthStore()
  const [files, setFiles] = useState<File[]>([])
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: 1,
    },
  })

  async function onSubmit(data: FormValues) {
    setSubmitError('')
    const needsWhatsapp = !isAuthenticated || !user?.whatsapp
    if (needsWhatsapp && (!data.customerWhatsapp || data.customerWhatsapp.length < 10)) {
      setSubmitError('Informe seu WhatsApp com DDD.')
      return
    }
    try {
      await quoteService.create({
        ...data,
        files,
      })
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
              Orçamento enviado com sucesso! Entraremos em contato em breve.
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
      <div style={{ padding: '100px 5% 80px' }}>
        {/* Two-column layout */}
        <div
          className="grid gap-[60px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
        >
          {/* Left — info */}
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

            {/* Perks */}
            <div className="flex flex-col gap-4">
              {[
                { icon: '⚡', title: 'Resposta em 24h', desc: 'Orçamento rápido e detalhado' },
                { icon: '🎨', title: 'Qualquer filamento', desc: 'PLA, PETG, ABS, Resina, TPU' },
                { icon: '📐', title: 'Modelagem inclusa', desc: 'Ajudamos com o arquivo 3D' },
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

          {/* Right — form card */}
          <div className="rounded-[18px] border border-border/30 bg-surface p-8 md:p-10">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              {/* Description */}
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-sm text-text-secondary">
                  Descrição do projeto
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className={[
                    inputCls(!!errors.description),
                    'resize-none',
                  ].join(' ')}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">{errors.description.message}</span>
                )}
              </div>

              {/* Material */}
              <div className="flex flex-col gap-1">
                <label htmlFor="material" className="text-sm text-text-secondary">
                  Material
                </label>
                <select
                  id="material"
                  {...register('material')}
                  className={inputCls(!!errors.material)}
                >
                  <option value="">Selecione...</option>
                  {MATERIALS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.material && (
                  <span className="text-xs text-red-500">{errors.material.message}</span>
                )}
              </div>

              {/* Color */}
              <Input
                id="color"
                label="Cor"
                error={errors.color?.message}
                {...register('color')}
              />

              {/* Quantity */}
              <Input
                id="quantity"
                label="Quantidade"
                type="number"
                min={1}
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />

              {/* Finish */}
              <div className="flex flex-col gap-1">
                <label htmlFor="finish" className="text-sm text-text-secondary">
                  Acabamento
                </label>
                <select
                  id="finish"
                  {...register('finish')}
                  className={inputCls(!!errors.finish)}
                >
                  <option value="">Selecione...</option>
                  {FINISHES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                {errors.finish && (
                  <span className="text-xs text-red-500">{errors.finish.message}</span>
                )}
              </div>

              {/* Desired Deadline */}
              <Input
                id="desiredDeadline"
                label="Prazo desejado"
                type="text"
                placeholder="AAAA-MM-DD"
                error={errors.desiredDeadline?.message}
                {...register('desiredDeadline')}
              />

              {/* File upload */}
              <div>
                <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">
                  Arquivos do projeto
                </h2>
                <FileUploadZone onFilesChange={setFiles} accept={ACCEPT} />
              </div>

              {/* Customer data */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 rounded-lg border border-accent-blue/20 bg-accent-blue/5 px-4 py-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-blue/20 text-sm">
                      ✓
                    </div>
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
                    <Input
                      id="customerWhatsapp"
                      label="WhatsApp (com DDD)"
                      type="tel"
                      error={errors.customerWhatsapp?.message}
                      {...register('customerWhatsapp')}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-4 pt-1">
                  <h2 className="font-heading text-sm font-semibold text-text-primary">
                    Seus dados (opcional)
                  </h2>

                  {/* Name + WhatsApp row */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      id="customerName"
                      label="Seu nome"
                      error={errors.customerName?.message}
                      {...register('customerName')}
                    />
                    <Input
                      id="customerWhatsapp"
                      label="WhatsApp (com DDD)"
                      type="tel"
                      error={errors.customerWhatsapp?.message}
                      {...register('customerWhatsapp')}
                    />
                  </div>

                  <Input
                    id="customerEmail"
                    label="Seu e-mail"
                    type="email"
                    error={errors.customerEmail?.message}
                    {...register('customerEmail')}
                  />
                </div>
              )}

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="w-full rounded-full hover:shadow-glow"
              >
                Enviar Orçamento
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}