import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { SEOHead } from '@/components/seo/SEOHead'

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const user = await authService.login(data.email, data.password)
      setUser(user)
      navigate(user.role === 'ADMIN' ? '/admin' : '/my-quotes')
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? 'E-mail ou senha inválidos')
    }
  }

  return (
    <>
      <SEOHead title="Entrar — Dimension.Lab3D" description="Acesse sua conta" canonical="/login" />

      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgb(var(--c-accent-blue) / 0.07) 0%, transparent 70%)' }} />

        <div className="relative w-full max-w-[420px] flex flex-col items-center gap-8">
          <Link to="/" className="flex items-baseline gap-0 font-heading">
            <span className="font-bold text-xl text-text-primary">DIMENSION</span>
            <span className="text-xl text-accent-blue">.LAB3D</span>
          </Link>

          <div className="w-full rounded-2xl p-8 flex flex-col gap-6"
               style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}>

            <div className="text-center">
              <p className="text-xs font-mono text-text-secondary uppercase tracking-widest mb-1">Bem-vindo de volta</p>
              <h1 className="text-xl font-bold text-text-primary">Entrar na conta</h1>
            </div>

            <div className="h-px" style={{ background: 'var(--glow-separator)', opacity: 0.18 }} />

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div>
                <label className="block font-mono uppercase mb-2"
                       style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgb(var(--c-text-secondary))' }}>
                  E-mail
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className="q-input w-full rounded-xl px-4 py-3 text-sm text-text-primary outline-none placeholder:text-border"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block font-mono uppercase mb-2"
                       style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'rgb(var(--c-text-secondary))' }}>
                  Senha
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="q-input w-full rounded-xl px-4 py-3 text-sm text-text-primary outline-none placeholder:text-border"
                />
                {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              {serverError && (
                <div className="rounded-xl px-4 py-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20">
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="q-submit-btn mt-1">
                {isSubmitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-text-secondary">ou</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>

            <button
              type="button"
              onClick={() => authService.loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium
                         text-text-primary bg-white/[0.04] border border-white/[0.08]
                         hover:bg-white/[0.08] hover:border-accent-blue/40 transition-all duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>

            <p className="text-center text-sm text-text-secondary">
              Não tem conta?{' '}
              <Link to="/register" className="text-accent-blue hover:underline font-medium">Criar conta</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
