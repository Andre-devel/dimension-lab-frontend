import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { SEOHead } from '@/components/seo/SEOHead'

const schema = z.object({
  name:     z.string().min(2, 'Informe seu nome'),
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const user = await authService.register(data.name, data.email, data.password)
      setUser(user)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setServerError(msg ?? 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <>
      <SEOHead
        title="Criar conta — Dimension.Lab3D"
        description="Crie sua conta na Dimension.Lab3D"
        canonical="/register"
      />

      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-[420px]">
          <Link to="/" className="flex items-baseline gap-0 font-heading mb-8 justify-center">
            <span className="font-bold text-text-primary">DIMENSION</span>
            <span className="text-accent-blue">.LAB3D</span>
          </Link>

          <div className="rounded-card border border-border bg-surface p-8 flex flex-col gap-6">
            <h1 className="text-xl font-semibold text-text-primary text-center">Criar conta</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <Input
                id="name"
                label="Nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                id="email"
                label="E-mail"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="password"
                label="Senha"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register('password')}
              />

              {serverError && (
                <p className="text-sm text-red-500 text-center">{serverError}</p>
              )}

              <Button type="submit" loading={isSubmitting} className="w-full mt-1">
                Criar conta
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-border" />
              <span className="text-xs text-text-secondary">ou</span>
              <hr className="flex-1 border-border" />
            </div>

            <button
              type="button"
              onClick={() => authService.loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2 rounded-btn border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary hover:border-accent-blue transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Cadastrar com Google
            </button>

            <p className="text-center text-sm text-text-secondary">
              Já tem conta?{' '}
              <Link to="/login" className="text-accent-blue hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}