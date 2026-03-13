import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/user'
import type { ReactNode } from 'react'

interface Props {
  role: UserRole
  children: ReactNode
}

export function PrivateRoute({ role, children }: Props) {
  const { user, isAuthenticated, isAuthLoading } = useAuthStore()

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />
  if (role === 'ADMIN' && user?.role !== 'ADMIN') return <Navigate to="/" replace />

  return <>{children}</>
}