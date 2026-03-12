import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FileUploadZone } from '@/components/ui/FileUploadZone'
import { quoteService } from '@/services/quoteService'
import { MATERIALS, FINISHES } from '@/constants/quoteStatus'

const schema = z.object({
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  material: z.string().min(1, 'Selecione um material'),
  color: z.string().min(1, 'Informe a cor'),
  quantity: z.number().min(1, 'Mínimo 1 unidade'),
  finish: z.string().min(1, 'Selecione um acabamento'),
  desiredDeadline: z.string().min(1, 'Informe o prazo'),
  customerName: z.string().optional(),
  customerEmail: z.string().email('E-mail inválido').optional().or(z.literal('')),
  customerWhatsapp: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const ACCEPT = '.jpg,.jpeg,.png,.mp4,.stl,.obj'

export default function QuoteRequest() {
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
    try {
      await quoteService.create({
        ...data,
        files,
      })
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
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-card border border-green-500/30 bg-green-500/10 p-6 text-center">
            <p className="font-medium text-green-400">
              Orçamento enviado com sucesso! Entraremos em contato em breve.
            </p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-2 font-heading text-3xl font-bold text-text-primary">
          Solicitar Orçamento
        </h1>
        <p className="mb-8 text-text-secondary">
          Preencha os detalhes do seu projeto e recebemos seu arquivo.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card className="mb-6 flex flex-col gap-5">
            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-sm text-text-secondary"
              >
                Descrição do projeto
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className={[
                  'rounded-btn border bg-surface px-3 py-2 text-sm text-text-primary outline-none resize-none',
                  'placeholder:text-text-secondary focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
                  errors.description ? 'border-red-500' : 'border-border',
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
                className={[
                  'rounded-btn border bg-surface px-3 py-2 text-sm text-text-primary outline-none',
                  'focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
                  errors.material ? 'border-red-500' : 'border-border',
                ].join(' ')}
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
                className={[
                  'rounded-btn border bg-surface px-3 py-2 text-sm text-text-primary outline-none',
                  'focus:border-accent-blue focus:ring-1 focus:ring-accent-blue',
                  errors.finish ? 'border-red-500' : 'border-border',
                ].join(' ')}
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
          </Card>

          {/* Files section */}
          <Card className="mb-6">
            <h2 className="mb-3 font-heading text-lg font-semibold text-text-primary">
              Arquivos do projeto
            </h2>
            <FileUploadZone
              onFilesChange={setFiles}
              accept={ACCEPT}
            />
          </Card>

          {/* Customer data (optional) */}
          <Card className="mb-6 flex flex-col gap-5">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Seus dados (opcional)
            </h2>
            <Input
              id="customerName"
              label="Seu nome"
              error={errors.customerName?.message}
              {...register('customerName')}
            />
            <Input
              id="customerEmail"
              label="Seu e-mail"
              type="email"
              error={errors.customerEmail?.message}
              {...register('customerEmail')}
            />
            <Input
              id="customerWhatsapp"
              label="WhatsApp (com DDD)"
              type="tel"
              error={errors.customerWhatsapp?.message}
              {...register('customerWhatsapp')}
            />
          </Card>

          {submitError && (
            <p className="mb-4 text-sm text-red-500">{submitError}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            className="w-full"
          >
            Enviar Orçamento
          </Button>
        </form>
      </div>
    </PageWrapper>
  )
}