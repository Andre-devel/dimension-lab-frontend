import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types/user'
import type { ReactNode } from 'react'

interface Props {
  role: UserRole
  children: ReactNode
}

export function PrivateRoute({ role, children }: Props) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/" replace />
  if (role === 'ADMIN' && user?.role !== 'ADMIN') return <Navigate to="/" replace />

  return <>{children}</>
}
